module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('artist', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      track_id: {
        type: Sequelize.INTEGER,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('artist');
  },
};
