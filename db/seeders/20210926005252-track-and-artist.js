const { trackModel } = require('../models/track');

const trackData = [
  {
    id: 1, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b273d679bf0538fa8509c5a1b9b2', title: 'White Christmas', ISRC: 'USMC14750470', name: [{ id: 1, name: 'Bing Crosby', track_id: 1 }, { id: 2, name: 'Ken Darby Singers', track_id: 1 }, { id: 3, name: 'John Scott Trotter & His Orchestra', track_id: 1 }],
  },
  {
    id: 2, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b273bbeed67ae4d0d0a041c568f4', title: 'Sentimental Journey (with Les Brown & His Orchestra)', ISRC: 'USSM14400046', name: [{ id: 4, name: 'Doris Day', track_id: 2 }, { id: 5, name: 'Les Brown & His Orchestra', track_id: 2 }],
  },
  {
    id: 3, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b273617d294cb6a9e77dfa58f818', title: 'shots in the dark (with Trippie Redd)', ISRC: 'QZJ842000925', name: [{ id: 8, name: 'iann dior', track_id: 3 }, { id: 9, name: 'Trippie Redd', track_id: 3 }],
  },
  {
    id: 4, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b2736afedd54245f027ce074450f', title: 'We Are The World - Live', ISRC: 'GBF079910780', name: [{ id: 10, name: 'Michael Jackson', track_id: 4 }, { id: 11, name: 'Lionel Richie', track_id: 4 }, { id: 12, name: 'Luciano Pavarotti', track_id: 4 }, { id: 13, name: 'Ricky Martin', track_id: 4 }, { id: 14, name: 'Zucchero', track_id: 4 }, { id: 15, name: 'B.B. King', track_id: 4 }, { id: 16, name: 'Gloria Estefan', track_id: 4 }, { id: 17, name: 'Joe Cocker', track_id: 4 }, { id: 18, name: 'Renato Zero', track_id: 4 }, { id: 19, name: 'Mariah Carey', track_id: 4 }, { id: 20, name: 'Shawn Pelton', track_id: 4 }, { id: 21, name: 'Boyzone', track_id: 4 }, { id: 22, name: 'Pino Palladino', track_id: 4 }, { id: 23, name: 'Rob Mathes', track_id: 4 }, { id: 24, name: 'Robbie Kondor', track_id: 4 }, { id: 25, name: 'Ars Canto G. Verdi', track_id: 4 }, { id: 26, name: 'Guatemala Choir', track_id: 4 }, { id: 27, name: 'Orchestra Sinfonica Italiana', track_id: 4 }, { id: 28, name: 'José Molina', track_id: 4 }, { id: 29, name: 'Gianni Morandi', track_id: 4 }, { id: 30, name: 'Laura Pausini', track_id: 4 }, { id: 31, name: 'Melanie Daniels', track_id: 4 }, { id: 32, name: 'Marianne Tatum', track_id: 4 }, { id: 33, name: 'Trey Lorenz', track_id: 4 }],
  },
  {
    id: 5, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b2739e5d7d870c963373a1c4d8f4', title: "Baby, It's Cold Outside", ISRC: 'USUM71412736', name: [{ id: 34, name: 'Seth MacFarlane', track_id: 5 }, { id: 35, name: 'Sara Bareilles', track_id: 5 }],
  },
  {
    id: 6, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b273f429dd2f1df9402ac9ea2971', title: 'I Will Always Love You', ISRC: 'USAR19200110', name: [{ id: 36, name: 'Whitney Houston', track_id: 6 }],
  },
  {
    id: 7, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526', title: 'Godspeed', ISRC: 'QZ5C81600016', name: [{ id: 37, name: 'Frank Ocean', track_id: 7 }],
  },
  {
    id: 8, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b2731973eafde6ad085ad785016c', title: 'Love Me Tender', ISRC: 'USRC10200075', name: [{ id: 38, name: 'Elvis Presley', track_id: 8 }],
  },
  {
    id: 9, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b273d0b49de6d117907eda4ab011', title: 'Love Me Tender', ISRC: 'USEA20000017', name: [{ id: 40, name: 'Linda Ronstadt', track_id: 9 }],
  },
  {
    id: 10, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b273328e50a92e7861c953368dda', title: 'Poker Face', ISRC: 'USUM70824409', name: [{ id: 41, name: 'Lady Gaga', track_id: 10 }],
  },
  {
    id: 11, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b273ab97157bc3ec59a65452ab54', title: 'Shape of You', ISRC: 'GBAHS1600463', name: [{ id: 42, name: 'Ed Sheeran', track_id: 11 }],
  },
  {
    id: 12, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b2737ed98d87959d2f2a1226dfc4', title: 'Thinking out Loud', ISRC: 'GBAHS1400099', name: [{ id: 43, name: 'Ed Sheeran', track_id: 12 }],
  },
  {
    id: 13, spotify_image_uri: 'https://i.scdn.co/image/ab67616d0000b2735c9890c0456a3719eeecd8aa', title: 'Bad Romance', ISRC: 'USUM70918596', name: [{ id: 42, name: 'Lady Gaga', track_id: 13 }],
  },
];
const trackValuesList = trackData.map((item) => ({ spotify_image_uri: item.spotify_image_uri, title: item.title, ISRC: item.ISRC }));
const artistValuesList = [];
trackData.forEach((track) => {
  track.name.forEach((item) => {
    artistValuesList.push({ name: item.name, track_id: item.track_id });
  });
});

module.exports = {
  up: (queryInterface) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.bulkInsert(
      { tableName: 'track', schema: queryInterface.sequelize.options.schema },
      trackValuesList,
      { transaction: t },
    ),
    queryInterface.bulkInsert(
      { tableName: 'artist', schema: queryInterface.sequelize.options.schema },
      artistValuesList,
      { transaction: t },
    ),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.bulkDelete(
      {
        tableName: 'track',
        schema: queryInterface.sequelize.options.schema,
      },
      { },
      {
        transaction: t,
      },
      trackModel,
    ),
  ])),
};
