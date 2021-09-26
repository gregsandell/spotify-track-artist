const { truncateValue } = require('../truncateValue');
const { Sequelize, sequelize } = require('./models-slash-index');

class PaymentTransaction extends Sequelize.Model {}

PaymentTransaction.init({
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: Sequelize.STRING(20),
    allowNull: true,
    references: {
      model: 'order_header',
      key: 'order_id',
    },
    onDelete: 'CASCADE',
  },
  payment_transaction_id: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  warp_drive_transaction_id: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  payment_transaction_type: {
    type: Sequelize.ENUM('ORDER_CAPTURE', 'PAYMENT_CAPTURE', 'REFUND_CAPTURE'),
    allowNull: false,
  },
  gateway: {
    type: Sequelize.STRING(50),
    allowNull: true,
  },
  presentment_price: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  shop_price: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  status: {
    type: Sequelize.TEXT(),
    defaultValue: 'UNKNOWN',
  },
  parent_id: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  exchange_rate: {
    type: Sequelize.NUMERIC(20, 11),
    allowNull: true,
  },
  authorization_id: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  currency: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  kind: {
    type: Sequelize.STRING(25),
    allowNull: true,
  },
  credit_card_bin: {
    type: Sequelize.STRING(10),
  },
  gift_card: {
    type: Sequelize.BOOLEAN,
    default: false,
  },
  gift_card_id: {
    type: Sequelize.STRING(20),
  },
  transaction_last_characters: {
    type: Sequelize.STRING(5),
  },
  cc_authorized_amount: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
  cc_funding: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  cc_expire_date: {
    type: Sequelize.STRING(7),
    allowNull: true,
  },
  cc_type: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  cc_avs_code: {
    type: Sequelize.STRING(20),
    allowNull: true,
    set(value) {
      this.setDataValue('cc_avs_code', truncateValue(value, 20));
    },
  },
  cc_cvv_code: {
    type: Sequelize.STRING(20),
    allowNull: true,
    set(value) {
      this.setDataValue('cc_cvv_code', truncateValue(value, 20));
    },
  },
  gc_shop_balance: {
    type: Sequelize.NUMERIC(12, 2),
    allowNull: true,
  },
}, {
  sequelize,
  schema: sequelize.options.schema,
  tableName: 'payment_transaction',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = PaymentTransaction;
