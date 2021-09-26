const trackModel = require('../models/track');
const artistModel = require('../models/artist');

module.exports = {
  up: (queryInterface) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.bulkDelete({
      tableName: 'track',
      schema: queryInterface.sequelize.options.schema,
    }, {},
    { transaction: t },
    trackModel),
    queryInterface.bulkDelete({
      tableName: 'artist',
      schema: queryInterface.sequelize.options.schema,
    }, {},
    { transaction: t },
    artistModel),
  ])),
  down: (queryInterface) => queryInterface.sequelize.transaction(() => Promise.all([])),
};
