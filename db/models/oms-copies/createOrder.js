const moment = require('moment-timezone');

const { createOrderDetails } = require('./createOrderDetail');
const { createOrderDiscountCode } = require('./createOrderDiscountCode');
const { getOrderType } = require('./getOrderType');
const { findBogoPromotions } = require('./bogo');
const { getOriginalOrderNumber, getReshipCCAgent, getReshipReason } = require('./reshipment');
const {
  getFixedShippingLine, checkItemsDuties, orderIsDeliveredDutiesUnpaid,
} = require('./utils');
const {
  formatAmounts, formatShippingPrices, formatPaymentFee, formatShippingAddress,
} = require('./formatData');
const {
  hasGiftCard,
  ORDER_TYPE_RESHIPMENT,
  OMS_STATUS,
  CONTEXT_STATUS,
  PAYMENT_TRANSACTION_TYPE,
  createOrderStatusLog,
  roundUp,
  getSafeProperty,

  isInternationalAddress,
  getRisk,
  getGiftCardTotalAmount,
  formatBillingAddress,
  STEP_FUNCTION,
  computeFxRate,
  getPaymentTransactions,
} = require('../../utils');
const { OrderHeader, OrderBilling, PaymentTransaction } = require('../../../db');
const Logger = require('../../logging/logger');
const { getCleanTransactions } = require('../../utils/removeTransactions');
const { NoRetry, Retry } = require('../../utils');

const applyPromo = (bogoPromotions, lineItem, amount) => {
  const isBogo = !!bogoPromotions[lineItem.id];
  if (!isBogo) return amount;
  return parseFloat(parseFloat(amount) * bogoPromotions[lineItem.id].promotion);
};

// Precalculate the total pre tax price before applying bogo (a)
// and the total pre tax price with bogo excluding the last bogo item (b)
// a - b will be use to calculate the price of the last bogo item avoiding rounding issues
const precalculateLineItems = (order, lineItems, bogoPromotions, paymentFxRate = 1) => {
  const precalc = {
    totalOriginalPreTaxPrice: {
      shop: parseFloat(order.subtotal_price_set.presentment_money.amount) * paymentFxRate,
      presentment: parseFloat(order.subtotal_price_set.presentment_money.amount),
    },
    totalPreTaxLastBogoExcluded: {
      shop: 0,
      presentment: 0,
    },
    totalTaxBogo: {
      shop: 0,
      presentment: 0,
    },
    totalDiscountBogo: {
      shop: 0,
      presentment: 0,
    },
    totalDutiesBogo: {
      shop: 0,
      presentment: 0,
    },
    totalDiscount: {
      shop: 0,
      presentment: 0,
    },
    totalDuties: {
      shop: 0,
      presentment: 0,
    },
    totalTax: {
      shop: 0,
      presentment: 0,
    },
  };
  let bogoCount = 0;
  lineItems.forEach((lineItem) => {
    const isBogo = !!bogoPromotions[lineItem.id];
    if (isBogo) {
      bogoCount += 1;
      precalc.totalTaxBogo.presentment += lineItem.tax_lines.reduce((acc, item) => acc + parseFloat(item.price_set.presentment_money.amount), 0.0);
      precalc.totalTaxBogo.shop = precalc.totalTaxBogo.presentment * paymentFxRate;
      precalc.totalDiscountBogo.presentment += lineItem.discount_allocations.reduce((acc, item) => acc + parseFloat(item.amount_set.presentment_money.amount), 0.0);
      precalc.totalDiscountBogo.shop = precalc.totalDiscountBogo.presentment * paymentFxRate;
      precalc.totalDutiesBogo.presentment += lineItem.duties.reduce((acc, item) => acc + parseFloat(getSafeProperty(() => item.price_set.presentment_money.amount) || 0.0), 0.0);
      precalc.totalDutiesBogo.shop = precalc.totalDutiesBogo.presentment * paymentFxRate;
    }
    if (bogoCount < Object.keys(bogoPromotions).length || !isBogo) {
      precalc.totalPreTaxLastBogoExcluded.presentment += parseFloat(applyPromo(bogoPromotions, lineItem, lineItem.price_set.presentment_money.amount * lineItem.quantity).toFixed(2));
      precalc.totalPreTaxLastBogoExcluded.shop = precalc.totalPreTaxLastBogoExcluded.presentment * paymentFxRate;
    }
    precalc.totalDiscount.shop += lineItem.discount_allocations.reduce((acc, item) => acc + parseFloat(item.amount_set.shop_money.amount), 0.0);
    precalc.totalDiscount.presentment += lineItem.discount_allocations.reduce((acc, item) => acc + parseFloat(item.amount_set.presentment_money.amount), 0.0);
    precalc.totalDuties.shop += lineItem.duties.reduce((acc, item) => acc + parseFloat(getSafeProperty(() => item.price_set.shop_money.amount, 0)), 0.0);
    precalc.totalDuties.presentment += lineItem.duties.reduce((acc, item) => acc + parseFloat(getSafeProperty(() => item.price_set.presentment_money.amount, 0)), 0.0);
    precalc.totalTax.shop += lineItem.tax_lines.reduce((acc, item) => acc + parseFloat(item.price_set.shop_money.amount), 0.0);
    precalc.totalTax.presentment += lineItem.tax_lines.reduce((acc, item) => acc + parseFloat(item.price_set.presentment_money.amount), 0.0);
  });
  return precalc;
};

const getAdjustedOrder = (order, paymentFxRate = 1) => {
  const res = {
    adjustedOrder: {},
    avalaraCaptureAdjustedOrder: {},
    isBogo: {},
  };

  res.adjustedOrder.shipping_lines = getFixedShippingLine(order);

  const adjustedLineItems = !res.adjustedOrder.line_items ? order.line_items : res.adjustedOrder.line_items;
  const bogoPromotions = findBogoPromotions(order.discount_codes_with_price_rules, adjustedLineItems, order);
  Logger.info('bogo promotion calculated', { bogoPromotions });
  const precalc = precalculateLineItems(order, adjustedLineItems, bogoPromotions, paymentFxRate);

  const totals = {
    shopDiscountAmount: 0,
    shopTaxAmount: 0,
    shopDutyAmount: 0,

    presentmentDiscountAmount: 0,
    presentmentTaxAmount: 0,
    presentmentDutyAmount: 0,
  };

  // Calculate adjusted order body for avalara, without rounding
  res.avalaraCaptureAdjustedOrder.line_items = adjustedLineItems.map((lineItem, idx) => {
    Logger.info('performing bogo for avalara body on line item', { lineItem });
    const isBogo = !!bogoPromotions[lineItem.id];
    if (!isBogo) Logger.info('order line does not use bogo', { lineItem, bogoPromotions });

    const presentmentPreTaxPriceSet = isBogo
      ? applyPromo(bogoPromotions, lineItem, lineItem.price_set.presentment_money.amount * lineItem.quantity)
      : lineItem.pre_tax_price_set.presentment_money.amount;
    const shopPreTaxPriceSet = presentmentPreTaxPriceSet * paymentFxRate;

    const duties = !bogoPromotions[lineItem.id] ? lineItem.duties : (() => {
      const presentmentDuty = bogoPromotions[lineItem.id].totalOriginalDuty.PRESENTMENT * (presentmentPreTaxPriceSet / bogoPromotions[lineItem.id].totalAdjustedPreTaxPrice.PRESENTMENT);
      const shopDuty = presentmentDuty * paymentFxRate;
      if (getSafeProperty(() => lineItem.duties[0].harmonized_system_code) && !shopDuty) return [lineItem.duties[0]];
      if (!shopDuty) return [];
      return [{
        id: 1,
        price: shopDuty.toString(),
        price_set: {
          shop_money: {
            amount: shopDuty.toString(),
            currency_code: lineItem.pre_tax_price_set.shop_money.currency_code,
          },
          presentment_money: {
            amount: presentmentDuty.toString(),
            currency_code: lineItem.pre_tax_price_set.presentment_money.currency_code,
          },
        },
        tax_lines: getSafeProperty(() => lineItem.duties[0].tax_lines) || [],
        admin_graphql_api_id: getSafeProperty(() => lineItem.duties[0].admin_graphql_api_id),
        country_code_of_origin: getSafeProperty(() => lineItem.duties[0].country_code_of_origin),
        harmonized_system_code: getSafeProperty(() => lineItem.duties[0].harmonized_system_code),
      }];
    })();
    const presentmentDutiesPriceSet = duties.reduce((total, duty) => total + parseFloat(getSafeProperty(() => duty.price_set.presentment_money.amount) || 0.0) || 0.0, 0.0);
    const shopDutiesPriceSet = presentmentDutiesPriceSet * paymentFxRate;

    Logger.info('shopPreTaxPriceSet', { shopPreTaxPriceSet });
    Logger.info('shopDutiesPriceSet', { shopDutiesPriceSet });
    Logger.info('presentmentPreTaxPriceSet', { presentmentPreTaxPriceSet });
    Logger.info('presentmentDutiesPriceSet', { presentmentDutiesPriceSet });
    return {
      id: lineItem.id,
      title: lineItem.title,
      quantity: lineItem.quantity,
      sku: lineItem.sku,
      tax_code: lineItem.tax_code,
      name: lineItem.name,
      pre_tax_price_set: isBogo ? {
        shop_money: {
          amount: shopPreTaxPriceSet.toString(),
          currency_code: lineItem.pre_tax_price_set.shop_money.currency_code,
        },
        presentment_money: {
          amount: presentmentPreTaxPriceSet.toString(),
          currency_code: lineItem.pre_tax_price_set.presentment_money.currency_code,
        },
      } : lineItem.pre_tax_price_set,
      discount_allocations: (() => {
        let presentmentAmount = roundUp(lineItem.price_set.presentment_money.amount * lineItem.quantity - presentmentPreTaxPriceSet);
        let shopAmount = roundUp(presentmentAmount * paymentFxRate);
        if (shopAmount === 0) return [];
        if (idx + 1 < adjustedLineItems.length) {
          totals.shopDiscountAmount += shopAmount;
          totals.presentmentDiscountAmount += presentmentAmount;
        } else {
          presentmentAmount = precalc.totalDiscount.presentment - totals.presentmentDiscountAmount;
          shopAmount = (precalc.totalDiscount.presentment * paymentFxRate) - totals.shopDiscountAmount;
        }
        Logger.info('discount', {
          lineId: lineItem.id,
          presentmentAmount,
          shopAmount,
        });
        return [{
          discount_application_index: 0,
          amount: roundUp(shopAmount),
          amount_set: {
            shop_money: {
              amount: roundUp(shopAmount),
              currency: lineItem.pre_tax_price_set.shop_money.currency_code,
            },
            presentment_money: {
              amount: roundUp(presentmentAmount),
              currency: lineItem.pre_tax_price_set.presentment_money.currency_code,
            },
          },
        }];
      })(),
      duties,
      origin_location: lineItem.origin_location,
      tax_lines: lineItem.gift_card || !bogoPromotions[lineItem.id] ? lineItem.tax_lines.map((tax) => ({
        ...tax,
        price: (parseFloat(tax.price_set.presentment_money.amount) * paymentFxRate).toFixed(2),
        price_set: {
          ...tax.price_set,
          shop_money: {
            ...tax.price_set.shop_money,
            amount: (parseFloat(tax.price_set.presentment_money.amount) * paymentFxRate).toFixed(2),
          },
          presentment_money: {
            ...tax.price_set.presentment_money,
            amount: (parseFloat(tax.price_set.presentment_money.amount)).toFixed(2),
          },
        },
      })) : (() => {
        const presentmentTaxPrice = bogoPromotions[lineItem.id].totalOriginalTax.PRESENTMENT * (presentmentPreTaxPriceSet / bogoPromotions[lineItem.id].totalAdjustedPreTaxPrice.PRESENTMENT);
        const shopTaxPrice = presentmentTaxPrice * paymentFxRate;
        const shopRate = (bogoPromotions[lineItem.id].totalOriginalTax.SHOP * (shopPreTaxPriceSet / bogoPromotions[lineItem.id].totalAdjustedPreTaxPrice.SHOP)) / shopPreTaxPriceSet;
        return [{
          price: shopTaxPrice.toString(),
          title: 'readjusted tax after BOGO calculation',
          rate: shopRate,
          price_set: {
            shop_money: {
              amount: shopTaxPrice.toString(),
              currency_code: lineItem.pre_tax_price_set.shop_money.currency_code,
            },
            presentment_money: {
              amount: presentmentTaxPrice.toString(),
              currency_code: lineItem.pre_tax_price_set.presentment_money.currency_code,
            },
          },
        }];
      })(),
    };
  });

  let bogoCount = 0;
  let appliedBogoShopTaxTotal = 0;
  let appliedBogoPresentmentTaxTotal = 0;
  let appliedBogoPresentmentDiscountTotal = 0;
  let appliedBogoShopDiscountTotal = 0;
  let appliedBogoShopDutiesTotal = 0;
  let appliedBogoPresentmentDutiesTotal = 0;
  // Calculate adjusted order body, with rounding
  res.adjustedOrder.line_items = res.avalaraCaptureAdjustedOrder.line_items.map((lineItem) => {
    Logger.info('performing bogo rounding for adjusted body on line item', { lineItem });
    const isBogo = !!bogoPromotions[lineItem.id];
    if (!isBogo) Logger.info('order line does not use bogo', { lineItem, bogoPromotions });
    if (isBogo) bogoCount += 1;

    let shopPreTaxPriceSet = 0;
    let presentmentPreTaxPriceSet = 0;
    if (bogoCount === Object.keys(bogoPromotions).length) {
      shopPreTaxPriceSet = roundUp(precalc.totalOriginalPreTaxPrice.shop - precalc.totalPreTaxLastBogoExcluded.shop);
      presentmentPreTaxPriceSet = roundUp(precalc.totalOriginalPreTaxPrice.presentment - precalc.totalPreTaxLastBogoExcluded.presentment);
    } else {
      shopPreTaxPriceSet = roundUp(lineItem.pre_tax_price_set.presentment_money.amount * paymentFxRate);
      presentmentPreTaxPriceSet = roundUp(lineItem.pre_tax_price_set.presentment_money.amount);
    }

    return {
      ...lineItem,
      pre_tax_price_set: isBogo ? {
        shop_money: {
          amount: shopPreTaxPriceSet.toString(),
          currency_code: lineItem.pre_tax_price_set.shop_money.currency_code,
        },
        presentment_money: {
          amount: presentmentPreTaxPriceSet.toString(),
          currency_code: lineItem.pre_tax_price_set.presentment_money.currency_code,
        },
      } : lineItem.pre_tax_price_set,
      discount_allocations: lineItem.discount_allocations.map((item) => {
        let shopDiscount = roundUp(item.amount_set.presentment_money.amount * paymentFxRate);
        let presentmentDiscount = roundUp(item.amount_set.presentment_money.amount);
        if (isBogo && bogoCount === Object.keys(bogoPromotions).length) {
          shopDiscount = roundUp(precalc.totalDiscountBogo.shop - roundUp(appliedBogoShopDiscountTotal));
          presentmentDiscount = roundUp(precalc.totalDiscountBogo.presentment - roundUp(appliedBogoPresentmentDiscountTotal));
        } else if (isBogo) {
          appliedBogoPresentmentDiscountTotal += presentmentDiscount;
          appliedBogoShopDiscountTotal += shopDiscount;
        }
        return {
          ...item,
          amount: shopDiscount,
          amount_set: {
            shop_money: {
              amount: shopDiscount,
              currency: lineItem.pre_tax_price_set.shop_money.currency_code,
            },
            presentment_money: {
              amount: presentmentDiscount,
              currency: lineItem.pre_tax_price_set.presentment_money.currency_code,
            },
          },
        };
      }),
      duties: lineItem.duties.length ? lineItem.duties.map((duty, idx) => {
        let presentmentDuty = parseFloat(getSafeProperty(() => duty.price_set.presentment_money.amount) || 0.0).toFixed(2);
        let shopDuty = roundUp(presentmentDuty * paymentFxRate).toFixed(2);
        if (isBogo && bogoCount === Object.keys(bogoPromotions).length && idx + 1 === lineItem.tax_lines.length) {
          shopDuty = (precalc.totalDutiesBogo.shop - parseFloat(appliedBogoShopDutiesTotal.toFixed(2))).toFixed(2);
          presentmentDuty = (precalc.totalDutiesBogo.presentment - parseFloat(appliedBogoPresentmentDutiesTotal.toFixed(2))).toFixed(2);
        } else if (isBogo) {
          appliedBogoShopDutiesTotal += parseFloat(shopDuty);
          appliedBogoPresentmentDutiesTotal += parseFloat(presentmentDuty);
        }
        return {
          ...duty,
          price: shopDuty,
          price_set: isBogo ? {
            shop_money: {
              amount: shopDuty,
              currency_code: lineItem.pre_tax_price_set.shop_money.currency_code,
            },
            presentment_money: {
              amount: presentmentDuty,
              currency_code: lineItem.pre_tax_price_set.presentment_money.currency_code,
            },
          } : getSafeProperty(() => duty.price_set),
        };
      }) : [],
      tax_lines: lineItem.tax_lines.length ? lineItem.tax_lines.map((taxLine, idx) => {
        let shopTax = roundUp(taxLine.price_set.presentment_money.amount * paymentFxRate).toFixed(2);
        let presentmentTax = roundUp(taxLine.price_set.presentment_money.amount).toFixed(2);
        if (isBogo && bogoCount === Object.keys(bogoPromotions).length && idx + 1 === lineItem.tax_lines.length) {
          shopTax = (precalc.totalTaxBogo.shop - parseFloat(appliedBogoShopTaxTotal.toFixed(2))).toFixed(2);
          presentmentTax = (precalc.totalTaxBogo.presentment - parseFloat(appliedBogoPresentmentTaxTotal.toFixed(2))).toFixed(2);
        } else if (isBogo) {
          appliedBogoShopTaxTotal += parseFloat(shopTax);
          appliedBogoPresentmentTaxTotal += parseFloat(presentmentTax);
        }
        return {
          ...taxLine,
          price: shopTax,
          rate: roundUp(taxLine.rate, 4),
          price_set: isBogo ? {
            shop_money: {
              amount: shopTax,
              currency_code: taxLine.price_set.shop_money.currency_code,
            },
            presentment_money: {
              amount: presentmentTax,
              currency_code: taxLine.price_set.presentment_money.currency_code,
            },
          } : taxLine.price_set,
        };
      }) : [],
    };
  });

  Logger.info('adjusted order done', res);
  return { ...res, isBogo: !!Object.keys(bogoPromotions).length };
};

const createOrder = async (dbTransaction, shopifyOrder) => {
  try {
    const paymentTransactions = getPaymentTransactions(shopifyOrder.transactions, PAYMENT_TRANSACTION_TYPE.ORDER_CAPTURE, shopifyOrder.warp_drive_transaction_id, shopifyOrder.id, shopifyOrder.payment_details);
    const cleanTransactions = getCleanTransactions(paymentTransactions);
    Logger.info('cleanTransactions', { cleanTransactions });
    const paymentFxRate = computeFxRate({
      orderEntryTransactions: cleanTransactions,
      paymentCaptureTransactions: [],
      stepFunction: STEP_FUNCTION.ORDER_CAPTURE_ENTRY,
    });
    Logger.info('Transactions informations', { paymentTransactions, cleanTransactions, paymentFxRate });

    const {
      adjustedOrder, avalaraCaptureAdjustedOrder, isBogo,
    } = getAdjustedOrder(shopifyOrder, paymentFxRate);
    // check order type and throw if error in reshipment order recognition
    const discountCodes = shopifyOrder.discount_applications
      .filter((da) => da.type === 'discount_code' || da.type === 'manual')
      .map((da) => (da.code ? da.code : da.title));
    const discountCode = discountCodes.length ? discountCodes[0] : null;
    const orderType = await getOrderType(discountCode);
    const originalOrderNumber = getOriginalOrderNumber(shopifyOrder.note);
    const reshipCCAgent = getReshipCCAgent(shopifyOrder.note);
    const reshipReason = getReshipReason(shopifyOrder.note);
    const isInternationalAdress = isInternationalAddress(shopifyOrder.shipping_address);
    const isDeliveredDutiesUnpaid = orderIsDeliveredDutiesUnpaid({ lineItems: shopifyOrder.line_items, orderType });

    if (orderType.order_type === ORDER_TYPE_RESHIPMENT && !originalOrderNumber) {
      throw new NoRetry('Unable to extract original order number from reshipment order');
    } else if (isInternationalAdress && !isDeliveredDutiesUnpaid) {
      checkItemsDuties({ lineItems: shopifyOrder.line_items });
    }

    const risk = getRisk(shopifyOrder.risks);
    const shippingLine = adjustedOrder.shipping_lines.length ? adjustedOrder.shipping_lines[0] : null;
    const billingAddress = shopifyOrder.billing_address ? formatBillingAddress(shopifyOrder.billing_address) : {};
    const shippingAddress = shopifyOrder.shipping_address ? formatShippingAddress(shopifyOrder.shipping_address) : {};

    const shippingPrices = formatShippingPrices(shippingLine, paymentFxRate);
    const totalAmounts = formatAmounts({
      paymentFxRate,
      shopifyOrder,
      adjustedOrder,
      shippingTax: {
        shop: shippingPrices.shop_shipping_tax,
        presentment: shippingPrices.presentment_shipping_tax,
      },
    });
    const paymentFee = formatPaymentFee(shopifyOrder, paymentFxRate);

    const customerLastName = getSafeProperty(() => shopifyOrder.customer.last_name) || 'FN Customer';

    const orderHeader = await OrderHeader.create({
      order_id: shopifyOrder.id, // PRIMARY KEY
      name: shopifyOrder.name,
      number: shopifyOrder.order_number,
      customer_id: shopifyOrder.customer.id,
      warp_drive_transaction_id: shopifyOrder.warp_drive_transaction_id,
      order_type: orderType.order_type,
      international_order: isInternationalAdress,
      processed_at: shopifyOrder.processed_at,
      order_status: OMS_STATUS.CREATED,
      oms_capture_date: moment.utc(),
      payment_method: shopifyOrder.gateway,
      gift_card_amount: getGiftCardTotalAmount(cleanTransactions),
      shop_currency: shopifyOrder.currency,
      presentment_currency: shopifyOrder.presentment_currency,
      gift_card_purchased: hasGiftCard(shopifyOrder.line_items),
      shopify_risk_rating: risk.shopify_risk_rating,
      shopify_risk_analysis: risk.shopify_risk_analysis,
      ip_address: shopifyOrder.browser_ip,
      ...totalAmounts,
      ...shippingAddress,
      ...shippingPrices,
      ...paymentFee,
      order_body: shopifyOrder,
      adjusted_order_body: adjustedOrder,
      avalara_capture_adjusted_body: avalaraCaptureAdjustedOrder,
      tax_details: shopifyOrder.tax_lines,
      original_order_number: originalOrderNumber,
      customer_first_name: getSafeProperty(() => shopifyOrder.customer.first_name) || customerLastName,
      customer_last_name: customerLastName,
      customer_phone: shopifyOrder.customer.phone,
      customer_email: shopifyOrder.customer.email,
      is_bogo: isBogo,
      delivered_duty_unpaid: isDeliveredDutiesUnpaid,
      cc_agent: reshipCCAgent,
      cc_note: reshipReason,
    }, {
      transaction: dbTransaction,
    });
    if (shopifyOrder.discount_codes.length) await createOrderDiscountCode({ orderId: shopifyOrder.id, listOfDiscount: shopifyOrder.discount_codes, dbTransaction });

    Logger.info('successful transactions', { cleanTransactions });

    Logger.info('order capture payment transaction', { cleanTransactions });
    await Promise.all(cleanTransactions.map((trans) => PaymentTransaction.create(trans, { transaction: dbTransaction })));

    await OrderBilling.create({ order_id: shopifyOrder.id, ...billingAddress }, { transaction: dbTransaction });

    await createOrderStatusLog(orderHeader, OMS_STATUS.CREATED, dbTransaction, CONTEXT_STATUS.ORDER_CAPTURE);

    const orderDetails = await createOrderDetails({
      totalHeaderAmounts: totalAmounts,
      transaction: dbTransaction,
      discountCode,
      orderHeader,
      adjustedOrder,
      shopifyOrder,
    });

    return {
      orderHeader,
      orderDetails,
      needFraudCheck: (orderType.need_fraud_check === true),
    };
  } catch (error) {
    const { original } = error;
    /* 23505 -> UNIQUE VIOLATION https://www.postgresql.org/docs/8.1/errcodes-appendix.html */
    if (original && original.code === '23505') {
      Logger.info('Order creation error: duplicate key', { error: original });
      throw new NoRetry('Partial duplication order');
    }
    Logger.error('Error while creating order', error);
    throw new Retry(error.message);
  }
};

module.exports = {
  createOrder,
  getAdjustedOrder,
  getOriginalOrderNumber,
  findBogoPromotions,
};
