const db = require('./models');
const DiscountCodeTermsAndConditions = require('./models/discountCodeTermsAndConditions');
const OrderHeader = require('./models/orderHeader');
const OrderBilling = require('./models/orderBilling');
const OrderDiscountCode = require('./models/orderDiscountCode');
const OrderDetail = require('./models/orderDetail');
const OrderStatusLog = require('./models/orderStatusLog');
const OrderFulfillment = require('./models/orderFulfillment');
const OrderType = require('./models/orderType');
const SlaShippingRules = require('./models/slaShippingRules');
const SlaQuickerStates = require('./models/slaQuickerStates');
const Transactions = require('./models/transactions');
const Refund = require('./models/refund');
const { RefundType } = require('./models/refundType');
const ReturnHeader = require('./models/returnHeader');
const ReturnDetail = require('./models/returnDetail');
const ErrorLogging = require('./models/errorLogging');
const SqsMessage = require('./models/sqsMessage');
const Execution = require('./models/execution');
const RefundDetail = require('./models/refundDetail');
const createAssociations = require('./associations');
const PaymentTransaction = require('./models/paymentTransaction');

const models = {
  DiscountCodeTermsAndConditions,
  OrderDiscountCode,
  RefundDetail,
  RefundType,
  OrderHeader,
  OrderBilling,
  OrderDetail,
  OrderStatusLog,
  OrderFulfillment,
  OrderType,
  SlaShippingRules,
  SlaQuickerStates,
  Transactions,
  Refund,
  ReturnHeader,
  ReturnDetail,
  ErrorLogging,
  SqsMessage,
  Execution,
  PaymentTransaction,
};

createAssociations(models);

module.exports = {
  ...db,
  ...models,
};
