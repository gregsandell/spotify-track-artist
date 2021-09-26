#!/usr/bin/env node

class DbUtil {
  constructor(Sequelize, sequelize, trackModel, artistModel) {
    this.Sequelize = Sequelize;
    this.sequelize = sequelize;
    this.trackModel = trackModel;
    this.artistModel = artistModel;
  }

  async insertTrack(input) {
    // Expected fields (all strings) spotify_image_uri, title, ISRC:
    const transaction = await this.sequelize.transaction();
    let succeeded = true;
    const obj = await this.trackModel.create(input, {
      transaction,
    }).catch((e) => {
      succeeded = false;
      if (/SequelizeUniqueConstraintError/.test(e.stack)) {
        console.warn(`Insert ignored because of already existing record for ISRC ${input.ISRC}`);
      } else {
        console.log(`Error = ${e}, stacktrace = ${e.stack}`);
      }
    });
    if (succeeded) {
      transaction.commit();
      console.log(`testTrackInsert() returned: ${JSON.stringify(obj)}, id = ${obj.id}`);
    }
    return obj ? obj.id : null;
  }

  async insertArtistArray(track_id, artists) {
    // Expected fields: track_id (int), name (string)
    const artistsInput = artists.map((artist) => ({ name: artist, track_id }));
    const transaction = await this.sequelize.transaction();
    const obj = await this.artistModel.bulkCreate(artistsInput, {
      transaction,
    }).catch((e) => {
      console.log(`Error = ${e}, stacktrace = ${e.stack}`);
    });
    transaction.commit();
    return obj;
  }

  async artistSearch(nameSubString) {
    const { Op } = this.Sequelize;
    const transaction = await this.sequelize.transaction();
    const obj = await this.trackModel.findAll({
      attributes: ['spotify_image_uri', 'title', 'ISRC'],
      include: [{
        as: 'name',
        model: this.artistModel,
        where: {
          name: {
            [Op.like]: `%${nameSubString}%`,
          },
        },
      }],
    }, {
      transaction,
    }).catch((e) => {
      console.log(`Error = ${e}, stacktrace = ${e.stack}`);
    });
    console.log(`testArtistSearch() outcome: ${JSON.stringify(obj)}`);
    return obj;
  }

  async songSearch(nameSubString) {
    const { Op } = this.Sequelize;
    const transaction = await this.sequelize.transaction();
    const obj = await this.trackModel.findAll({
      attributes: ['spotify_image_uri', 'title', 'ISRC'],
      where: {
        title: {
          [Op.like]: `%${nameSubString}%`,
        },
      },
      include: [{
        as: 'name',
        model: this.artistModel,
      }],
    }, {
      transaction,
    }).catch((e) => {
      console.log(`Error = ${e}, stacktrace = ${e.stack}`);
    });
    console.log(`testArtistSearch() outcome: ${JSON.stringify(obj)}`);
    return obj;
  }

  async getTrackByPrimaryKey(id) {
    const { Op } = this.Sequelize;
    const transaction = await this.sequelize.transaction();
    const obj = await this.trackModel.findAll({
      attributes: ['id', 'spotify_image_uri', 'title', 'ISRC'],
      include: [{
        as: 'name',
        model: this.artistModel,
        where: {
          track_id: {
            [Op.eq]: id,
          },
        },
      }],
    }, {
      transaction,
    }).catch((e) => {
      console.log(`Error = ${e}, stacktrace = ${e.stack}`);
    });
    console.log(`textGetLocalDataById() outcome: ${JSON.stringify(obj)}`);
    return obj;
  }

  async getTrackByISRC(ISRC) {
    const { Op } = this.Sequelize;
    const transaction = await this.sequelize.transaction();
    const obj = await this.trackModel.findAll({
      attributes: ['id', 'spotify_image_uri', 'title', 'ISRC'],
      where: {
        ISRC: {
          [Op.eq]: ISRC,
        },
      },
      include: [{
        as: 'name',
        model: this.artistModel,
      }],
    }, {
      transaction,
    }).catch((e) => {
      console.log(`Error = ${e}, stacktrace = ${e.stack}`);
    });
    console.log(`testGetLocalTrackByISRC() outcome: ${JSON.stringify(obj)}`);
    return obj;
  }
}
module.exports = DbUtil;
