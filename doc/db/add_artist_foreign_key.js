module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => {
        const artistTable = {
            tableName: 'Artist',
            schema: queryInterface.sequelize.options.schema,
        };

        const options = {
            transaction: t,
        };

        return Promise.all([
            // ORDER_FULFILLMENT
            queryInterface.addColumn(artistTable, 'track_id', {
                type: Sequelize.STRING(20),
                allowNull: true,
                references: {
                    model: 'track',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            }, options),
        ]);
    }),

    down: (queryInterface) => queryInterface.sequelize.transaction((t) => {
        const artistTable = {
            tableName: 'Artist',
            schema: queryInterface.sequelize.options.schema,
        };

        const options = {
            transaction: t,
        };

        return Promise.all([
            queryInterface.removeColumn(artistTable, 'track_id', options),
        ]);
    }),
};
