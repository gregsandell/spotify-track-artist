/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config.js`)[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

module.exports = {
  sequelize,
  Sequelize,
};
