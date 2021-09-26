#!/usr/bin/env node
const fetch = require('node-fetch');
const querystring = require('querystring');

const getToken = async () => {
  const { SPOTIFY_BASE_AUTH_URL, SPOTIFY_TOKEN_ENDPOINT, SPOTIFY_AUTH } = process.env;
  const url = `${SPOTIFY_BASE_AUTH_URL}${SPOTIFY_TOKEN_ENDPOINT}?grant_type=client_credentials`;
  let token;
  await fetch(url, {
    headers: {
      Authorization: SPOTIFY_AUTH,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  }).then((data) => data.json())
    .then((json) => {
      token = json.access_token;
    })
    .catch((e) => {
      console.log(`Error fetching spotify token = ${e}, stack trace =${e.stack}`);
    });
  return token;
};

const getTrackByISRC = async (ISRC) => {
  const token = await getToken();
  const params = { q: `isrc:${ISRC}`, type: 'track' };
  const { SPOTIFY_BASE_URL, SPOTIFY_SEARCH_ENDPOINT } = process.env;
  const url = `${SPOTIFY_BASE_URL}${SPOTIFY_SEARCH_ENDPOINT}?${querystring.stringify(params)}`;
  let result;
  await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/json',
    },
  }).then((data) => data.json())
    .then((json) => {
      result = json;
    })
    .catch((e) => {
      console.log(`Error fetching spotify token = ${e}, stack trace =${e.stack}`);
    });
  return result;
};

const getTrackBySong = async (track) => {
  const token = await getToken();
  const params = { q: track, type: 'track' };
  const { SPOTIFY_BASE_URL, SPOTIFY_SEARCH_ENDPOINT } = process.env;
  const url = `${SPOTIFY_BASE_URL}${SPOTIFY_SEARCH_ENDPOINT}?${querystring.stringify(params)}`;
  let result;
  await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/json',
    },
  }).then((data) => data.json())
    .then((json) => {
      result = json;
    })
    .catch((e) => {
      console.log(`Error fetching spotify token = ${e}, stack trace =${e.stack}`);
    });
  return result;
};

const getMeta = (spotifyData, idx) => {
  const mostPopularItem = spotifyData.tracks.items.sort((item1, item2) => item2.popularity - item1.popularity)[spotifyData.tracks.items.length - 1];
  const mostPopularImg = mostPopularItem.album.images[0].url;
  const preferredItem = spotifyData.tracks.items[idx];
  return {
    artistNames: preferredItem.artists.map((artist) => artist.name),
    spotify_image_uri: mostPopularImg,
    title: preferredItem.name,
  };
};
module.exports = {
  getToken,
  getTrackByISRC,
  getTrackBySong,
  getMeta,
};
