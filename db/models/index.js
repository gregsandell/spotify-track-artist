/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const config = require('../config');

const sequelize = new Sequelize(config.database, config.username, config.password, config);

module.exports = {
  sequelize,
  Sequelize,
};
