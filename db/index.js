const db = require('./models');
const artistModel = require('./models/artist');
const trackModel = require('./models/track');
const createAssociations = require('./associations');

const models = {
  trackModel,
  artistModel,
};

createAssociations(models);

module.exports = {
  ...db,
  ...models,
};
