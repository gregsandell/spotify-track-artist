module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.createTable({
      tableName: 'payment_transaction',
      schema: queryInterface.sequelize.options.schema,
    }, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      payment_transaction_id: {
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
      status: {
        type: Sequelize.TEXT(),
        defaultValue: 'UNKNOWN',
      },
      parent_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      authorization_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      exchange_rate: {
        type: Sequelize.NUMERIC(14, 5),
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
      created_at: {
        type: Sequelize.DATE(),
      },
      updated_at: {
        type: Sequelize.DATE(),
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
      warp_drive_transaction_id: {
        type: Sequelize.STRING(100),
      },
    }, {
      transaction: t,
    }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.dropTable({
      tableName: 'payment_transaction',
      schema: queryInterface.sequelize.options.schema,
    }, {
      transaction: t,
    }),
  ])),
};
