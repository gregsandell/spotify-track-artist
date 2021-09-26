module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => {
    const paymentTransactionTable = {
      tableName: 'payment_transaction',
      schema: queryInterface.sequelize.options.schema,
    };

    const options = {
      transaction: t,
    };

    return Promise.all([
      // ORDER_FULFILLMENT
      queryInterface.addColumn(paymentTransactionTable, 'order_id', {
        type: Sequelize.STRING(20),
        allowNull: true,
        references: {
          model: 'order_header',
          key: 'order_id',
        },
        onDelete: 'CASCADE',
      }, options),
    ]);
  }),

  down: (queryInterface) => queryInterface.sequelize.transaction((t) => {
    const paymentTransactionTable = {
      tableName: 'payment_transaction',
      schema: queryInterface.sequelize.options.schema,
    };

    const options = {
      transaction: t,
    };

    return Promise.all([
      queryInterface.removeColumn(paymentTransactionTable, 'order_id', options),
    ]);
  }),
};
