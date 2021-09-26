const createAssociations = ({
  ReturnDetail,
  ReturnHeader,
  OrderHeader,
  OrderBilling,
  OrderDetail,
  OrderFulfillment,
  Refund,
  RefundDetail,
  SlaShippingRules,
  OrderDiscountCode,
  OrderStatusLog,
  OrderType,
  PaymentTransaction,
}) => {
  // ORDER_HEADER 1:1 ORDER_BILLING
  OrderHeader.hasOne(OrderBilling, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
    as: 'order_billing',
    onDelete: 'CASCADE',
  });

  OrderBilling.belongsTo(OrderHeader, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
  });

  // ORDER_DETAIL 1:m ORDER_FULFILLMENT
  OrderDetail.hasMany(OrderFulfillment, {
    foreignKey: 'order_line_id',
    targetKey: 'order_line_id',
    onDelete: 'CASCADE',
  });

  OrderFulfillment.belongsTo(OrderDetail, {
    foreignKey: 'order_line_id',
    targetKey: 'order_line_id',
    as: 'order_detail',
  });

  // RETURN_HEADER 1:m RETURN_DETAIL
  ReturnHeader.hasMany(ReturnDetail, {
    foreignKey: 'return_header_id',
    targetKey: 'id',
    onDelete: 'CASCADE',
  });

  ReturnDetail.belongsTo(ReturnHeader, {
    foreignKey: 'return_header_id',
    targetKey: 'id',
    as: 'return_header',
  });

  // RETURN_DETAIL 1:m ORDER_FULFILLMENT
  OrderFulfillment.hasMany(ReturnDetail, {
    foreignKey: 'order_line_id',
    targetKey: 'order_line_id',
  });

  ReturnDetail.belongsTo(OrderFulfillment, {
    foreignKey: 'order_line_id',
    targetKey: 'order_line_id',
    as: 'order_fulfillment',
  });

  // ORDER_HEADER 1:m RETURN_HEADER
  OrderHeader.hasMany(ReturnHeader, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
    onDelete: 'CASCADE',
  });

  ReturnHeader.belongsTo(OrderHeader, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
  });

  // REFUND 1:m REFUND_DETAIL
  Refund.hasMany(RefundDetail, {
    foreignKey: 'refund_id',
    targetKey: 'id',
    as: 'refund_details',
    onDelete: 'CASCADE',
  });

  RefundDetail.belongsTo(Refund, {
    foreignKey: 'refund_id',
    targetKey: 'id',
  });

  // ORDER_HEADER 1:m REFUND
  OrderHeader.hasMany(Refund, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
    onDelete: 'CASCADE',
  });

  // ORDER_DETAIL 1:m REFUND_DETAIL
  OrderDetail.hasMany(RefundDetail, {
    foreignKey: 'order_line_id',
    targetKey: 'order_line_id',
    as: 'refund_details',
    onDelete: 'CASCADE',
  });

  Refund.belongsTo(OrderHeader, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
  });
  OrderHeader.hasMany(OrderDetail, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
    as: 'order_details',
    onDelete: 'CASCADE',
  });

  OrderDetail.belongsTo(OrderHeader, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
  });
  RefundDetail.belongsTo(OrderDetail, {
    foreignKey: 'order_line_id',
    targetKey: 'order_line_id',
    as: 'order_detail',
  });
  // ORDER_HEADER 1:m ORDER_DISCOUNT_CODE
  OrderHeader.hasMany(OrderDiscountCode, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
    onDelete: 'CASCADE',
    as: 'order_discount_codes',
  });

  OrderDiscountCode.belongsTo(OrderHeader, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
    as: 'order_discount_codes',
  });

  // RETURN_HEADER 1:1 REFUND
  ReturnHeader.hasOne(Refund, {
    foreignKey: 'return_id',
    targetKey: 'id',
    as: 'refund',
    onDelete: 'CASCADE',
  });

  Refund.belongsTo(ReturnHeader, {
    foreignKey: 'return_id',
    as: 'return_header',
    targetKey: 'id',
  });

  // ORDER_HEADER 1:m ORDER_STATUS_LOG
  OrderHeader.hasMany(OrderStatusLog, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
    onDelete: 'CASCADE',
    as: 'order_status_log',
  });

  OrderStatusLog.belongsTo(OrderHeader, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
    as: 'order_status_log',
  });

  // ORDER_HEADER m:1 ORDER_TYPE
  OrderHeader.hasOne(OrderType, {
    foreignKey: 'order_type',
    targetKey: 'order_type',
    as: 'order_type_rel',
  });

  // ORDER_HEADER 1:M ORDER_DETAIL
  OrderHeader.hasMany(OrderDetail, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
    onDelete: 'CASCADE',
    as: 'order_detail',
  });

  OrderDetail.belongsTo(OrderHeader, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
    as: 'order_detail',
  });

  // shipping_method is a fake foreign key but we need that field to include slaShippingRules with a 'join'
  OrderHeader.hasOne(SlaShippingRules, {
    foreignKey: 'shipping_method',
    as: 'sla_shipping_rules',
  });

  // ORDER_HEADER 1:m PaymentTransaction
  OrderHeader.hasMany(PaymentTransaction, {
    as: 'payment_transaction',
    foreignKey: 'order_id',
    targetKey: 'order_id',
    onDelete: 'CASCADE',
  });
  PaymentTransaction.belongsTo(OrderHeader, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
  });
};

module.exports = createAssociations;
