#!/usr/bin/env node
const {
  Sequelize, sequelize, trackModel, artistModel,
} = require('../index');
const DbUtil = require('../../src/dbUtil');
const spotUtil = require('../../src/spotUtil');

const dbUtil = new DbUtil(Sequelize, sequelize, trackModel, artistModel);
(async () => {
  // const id = await dbUtil.testTrackInsert({
  //   spotify_image_uri: 'yoo hoo',
  //   title: 'Philosophy Of The World',
  //   ISRC: '42',
  // });
  // console.log(`id = ${id}`);
  // if (id) {
  //   await dbUtil.testArtistArrayInsert(parseInt(id, 10), ['The Shaggs', 'The Mothers']);
  //   await dbUtil.testArtistArrayInsert(parseInt(id, 10), ['Abbott', 'Costello']);
  //   dbUtil.testGetLocalDataById(id);
  // }
  // const searchResult = dbUtil.testArtistSearch('gaga');
  // console.log(`testArtistSearch() result 1 = ${JSON.stringify(searchResult)}`);
  const data = await spotUtil.getTrackByISRC('QZJ842000925');
  const result = spotUtil.getMeta(data, 1);
  console.log(JSON.stringify(result));
})();
