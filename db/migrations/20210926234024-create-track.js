module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('track', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      spotify_image_uri: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ISRC: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('track');
  },
};
