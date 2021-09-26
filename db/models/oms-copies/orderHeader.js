const { truncateValue } = require('../truncateValue');
const { Sequelize, sequelize } = require('./models-slash-index');

class OrderHeader extends Sequelize.Model {}

OrderHeader.init({
  order_id: {
    type: Sequelize.STRING(20),
    allowNull: true,
    primaryKey: true,
  },
  number: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  customer_id: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  warp_drive_transaction_id: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  order_type: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  transactions_body: {
    type: Sequelize.JSONB,
    allowNull: true,
  },
  avalara_timeout_processed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  international_order: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  use_avalara_taxes: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  order_status: {
    type: Sequelize.STRING(50),
    allowNull: true,
  },
  oms_capture_date: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  cancelled_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  cancel_reason: {
    type: Sequelize.STRING(50),
    allowNull: true,
  },
  shop_total_price: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  presentment_total_price: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  shop_subtotal_price: {
    type: Sequelize.NUMERIC(14, 4),
    allowNull: true,
  },
  presentment_subtotal_price: {
    type: Sequelize.NUMERIC(14, 4),
    allowNull: true,
  },
  shop_total_discounts: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  presentment_total_discounts: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  shop_total_tax: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  presentment_total_tax: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  shop_shipping_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  presentment_shipping_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  shop_shipping_tax: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  sla_breach_processed: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  presentment_shipping_tax: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  shop_total_duties: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  presentment_total_duties: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  shipping_method: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  shop_payment_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  presentment_payment_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  payment_method: {
    type: Sequelize.STRING(50),
    allowNull: true,
  },
  gift_card_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  shop_currency: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  presentment_currency: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  gift_card_purchased: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  gift_card_fulfillment_date: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  shopify_risk_rating: {
    type: Sequelize.NUMERIC(14, 4),
    allowNull: true,
  },
  shopify_risk_analysis: {
    type: Sequelize.STRING(200),
    allowNull: true,
  },
  ip_address: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  accertify_recommendation: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  accertify_score: {
    type: Sequelize.STRING(50),
    allowNull: true,
  },
  accertify_cross_reference: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  accertify_last_processed: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  accertify_acceptance_datetime: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  intl_tax_company_liability: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  intl_tax_amount: {
    type: Sequelize.NUMERIC(14, 4),
    allowNull: true,
  },
  intl_duty_tax_amount: {
    type: Sequelize.NUMERIC(14, 4),
    allowNull: true,
  },
  intl_shipping_tax_rate: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  payment_result_reprocess: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  intl_shipping_tax_amount: {
    type: Sequelize.NUMERIC(14, 4),
    allowNull: true,
  },
  intl_shipping_duty_tax_rate: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  intl_shipping_duty_tax_amount: {
    type: Sequelize.NUMERIC(14, 4),
    allowNull: true,
  },
  intl_currency_code: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  intl_original_currency_amount: {
    type: Sequelize.NUMERIC(14, 4),
    allowNull: true,
  },
  shipping_first_name: {
    type: Sequelize.STRING(100),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_first_name', truncateValue(value, 100));
    },
  },
  shipping_last_name: {
    type: Sequelize.STRING(100),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_last_name', truncateValue(value, 100));
    },
  },
  shipping_name: {
    type: Sequelize.STRING(150),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_name', truncateValue(value, 150));
    },
  },
  shipping_company: {
    type: Sequelize.STRING(100),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_company', truncateValue(value, 100));
    },
  },
  shipping_address1: {
    type: Sequelize.STRING(150),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_address1', truncateValue(value, 150));
    },
  },
  shipping_address2: {
    type: Sequelize.STRING(150),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_address2', truncateValue(value, 150));
    },
  },
  shipping_city: {
    type: Sequelize.STRING(50),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_city', truncateValue(value, 50));
    },
  },
  shipping_province: {
    type: Sequelize.STRING(50),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_province', truncateValue(value, 50));
    },
  },
  shipping_zip: {
    type: Sequelize.STRING(36),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_zip', truncateValue(value, 36));
    },
  },
  shipping_country: {
    type: Sequelize.STRING(50),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_country', truncateValue(value, 50));
    },
  },
  shipping_country_code: {
    type: Sequelize.STRING(36),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_country_code', truncateValue(value, 36));
    },
  },
  shipping_province_code: {
    type: Sequelize.STRING(36),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_province_code', truncateValue(value, 36));
    },
  },
  shipping_phone: {
    type: Sequelize.STRING(100),
    allowNull: true,
    set(value) {
      this.setDataValue('shipping_phone', truncateValue(value, 100));
    },
  },
  shipping_latitude: {
    type: Sequelize.STRING(36),
    allowNull: true,
  },
  shipping_longitude: {
    type: Sequelize.STRING(36),
    allowNull: true,
  },
  original_order_number: {
    type: Sequelize.STRING(20),
    allowNull: true,
    primaryKey: false,
  },
  fraud_date: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  warehouse_sla: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  customer_sla: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  sla_calculation_date: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  sent_to_wms_date: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  fulfillment_date: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  cc_capture_date: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  last_tran_id: {
    type: Sequelize.BIGINT,
    allowNull: true,
  },
  order_body: {
    type: Sequelize.JSONB,
    allowNull: true,
  },
  tax_details: {
    type: Sequelize.JSONB,
    allowNull: true,
  },
  avalara_presentment_shipping_tax: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_presentment_shipping_discounted_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_presentment_total_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_presentment_total_tax: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_presentment_total_duties: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_shop_shipping_tax: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_shop_total_price: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_presentment_total_price: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_shop_shipping_discounted_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_shop_total_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_shop_total_tax: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_shop_total_duties: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  avalara_currency: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  avalara_company_code: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  processed_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  avalara_tax_body: {
    type: Sequelize.JSONB,
    allowNull: true,
  },
  adjusted_order_body: {
    type: Sequelize.JSONB,
    allowNull: true,
  },
  customer_first_name: {
    type: Sequelize.STRING(50),
    allowNull: true,
    set(value) {
      this.setDataValue('customer_first_name', truncateValue(value, 50));
    },
  },
  customer_last_name: {
    type: Sequelize.STRING(50),
    allowNull: true,
    set(value) {
      this.setDataValue('customer_last_name', truncateValue(value, 50));
    },
  },
  customer_email: {
    type: Sequelize.STRING(50),
    allowNull: true,
    set(value) {
      this.setDataValue('customer_email', truncateValue(value, 50));
    },
  },
  customer_phone: {
    type: Sequelize.STRING(20),
    allowNull: true,
    set(value) {
      this.setDataValue('customer_phone', truncateValue(value, 20));
    },
  },
  is_bogo: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  name: {
    type: Sequelize.STRING(20),
    allowNull: true,
    set(value) {
      this.setDataValue('name', truncateValue(value, 20));
    },
  },
  presentment_shipping_discounted_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  shop_shipping_discounted_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  payment_fx_rate: {
    type: Sequelize.NUMERIC(14, 5),
    allowNull: true,
  },
  avalara_capture_adjusted_body: {
    type: Sequelize.JSONB,
    allowNull: true,
  },
  shop_shipping_discount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  presentment_shipping_discount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  already_refunded_gift_card_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  delivered_duty_unpaid: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  sla_breach_processed_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  voided: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  shop_payment_fee: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  presentment_payment_fee: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  payment_fee_authorization_id: {
    type: Sequelize.STRING(50),
    allowNull: true,
  },
  cc_agent: {
    type: Sequelize.STRING(350),
    allowNull: true,
    set(value) {
      this.setDataValue('cc_agent', truncateValue(value, 350));
    },
  },
  cc_note: {
    type: Sequelize.TEXT(),
    allowNull: true,
  },
  skip_avalara: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  internal_admin_note: {
    type: Sequelize.TEXT(),
    allowNull: true,
  },
}, {
  sequelize,
  schema: sequelize.options.schema,
  tableName: 'order_header',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = OrderHeader;
