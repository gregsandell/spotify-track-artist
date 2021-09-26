const { Sequelize, sequelize } = require('./index');

class Track extends Sequelize.Model {}

Track.init({
  spotify_image_uri: {
    type: Sequelize.STRING(200),
  },
  title: {
    type: Sequelize.STRING(100),
  },
  ISRC: {
    type: Sequelize.STRING,
    unique: true,
  },
}, {
  sequelize,
  tableName: 'track',
  freezeTableName: true,
  createdAt: false,
  updatedAt: false,
});

module.exports = Track;
