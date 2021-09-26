const { Sequelize, sequelize } = require('./index');

class Artist extends Sequelize.Model {}

Artist.init({
  name: {
    type: Sequelize.STRING(100),
  },
  track_id: {
    type: Sequelize.INTEGER,
  },
}, {
  sequelize,
  tableName: 'artist',
  freezeTableName: true,
  createdAt: false,
  updatedAt: false,
});

module.exports = Artist;
