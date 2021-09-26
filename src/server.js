/* eslint-disable node/no-deprecated-api */
const express = require('express');
const bodyParser = require('body-parser');
const url = require('url');

const router = express.Router();

const app = express();
const port = process.env.PORT || 5000;
const DbUtil = require('./dbUtil');
const {
  Sequelize, sequelize, trackModel, artistModel,
} = require('../db');
const spotUtil = require('./spotUtil');

const dbUtil = new DbUtil(Sequelize, sequelize, trackModel, artistModel);

app.use('/api', router); // Will catch any other paths beginning '/api'
const urlencodedParser = bodyParser.urlencoded({ extended: true });

// This will capture errors in Promise handling that for some reason don't throw normal NodeJs exceptions
process.on('unhandledRejection', (reason, p) => {
  console.log('ERROR: unhandled Promise Rejection:', reason, '\nStack trace:\n', p);
});

router.get('/check', (req, res) => {
  res.status(200).send({ hello: 'world' });
});

router.post('/add-track', urlencodedParser, async (req, res) => {
  let output;
  const isValid = (_req) => _req.body && _req.body.ISRC && _req.body.idx && Number.isNaN(parseInt(_req.body.ISRC, 10)) && !Number.isNaN(parseInt(_req.body.idx, 10));
  let status = 201;
  if (!isValid(req)) {
    output = { status: 'fail', mesg: 'Required \'ISRC\' or \'idx\' body parameters absent or of wrong type' };
    status = 400;
  } else {
    const { ISRC, idx } = req.body;
    const result = await spotUtil.getTrackByISRC(ISRC);
    const isViable = () => result.tracks && result.tracks.items && parseInt(idx, 10) < result.tracks.items.length;
    if (isViable()) {
      const { artistNames, spotify_image_uri, title } = spotUtil.getMeta(result, parseInt(idx, 10));
      const id = await dbUtil.insertTrack({ spotify_image_uri, title, ISRC });
      if (id) {
        await dbUtil.insertArtistArray(parseInt(id, 10), artistNames);
        output = { status: 'succeed', data: await dbUtil.getTrackByPrimaryKey(id) };
        status = 201;
      } else {
        output = { status: 'succeed', mesg: 'Duplicate ISRC insert ignored' };
        status = 202;
      }
    } else {
      output = { status: 'fail', mesg: `No track found with ISRC ${req.body.ISRC}, or track ISRC ${req.body.ISRC} items length is out of range for index ${req.body.idx}` };
      status = 404;
    }
  }

  res.status(status).send(output);
});
router.get('/search-artist', urlencodedParser, async (req, res) => {
  let output;
  // console.log(Object.keys(req).join(', '));
  const queryObj = url.parse(req.url, true).query;
  const isValid = () => queryObj.q;
  let status = 200;
  if (!isValid()) {
    output = { status: 'fail', mesg: 'Required \'q\' query parameter absent' };
    status = 400;
  } else {
    const { q } = queryObj;
    const result = await dbUtil.artistSearch(q);
    status = result.length ? 200 : 404;
    output = { status: result.length ? 'succeed' : 'fail', mesg: result.length ? result : `No artists containing substring '${queryObj.q}' were found.` };
  }

  res.status(status).send(output);
});
router.get('/search-song', urlencodedParser, async (req, res) => {
  let output;
  const queryObj = url.parse(req.url, true).query;
  const isValid = () => queryObj.q;
  let status = 200;
  if (!isValid()) {
    output = { status: 'fail', mesg: 'Required "q" query parameter absent' };
    status = 400;
  } else {
    const { q } = queryObj;
    const result = await dbUtil.songSearch(q);
    status = result.length ? 200 : 404;
    output = { status: result.length ? 'succeed' : 'fail', mesg: result.length ? result : `No songs with substring '${queryObj.q}' were found.` };
  }

  res.status(status).send(output);
});

router.get('/search-isrc', urlencodedParser, async (req, res) => {
  let output;
  const queryObj = url.parse(req.url, true).query;
  const isValid = () => queryObj.q;
  let status = 200;
  if (!isValid(req)) {
    output = { status: 'fail', mesg: 'Required \'q\' query parameter absent' };
    status = 400;
  } else {
    const { q } = queryObj;
    const result = await dbUtil.getTrackByISRC(q);
    status = result.length ? 200 : 404;
    output = { status: result.length ? 'succeed' : 'fail', mesg: result.length ? result : `No track with ISRC ${queryObj.q} could be found` };
  }

  res.status(status).send(output);
});

// If the url didn't bind to any one of the above routes, then it's an an unknown path.
// Treat it as a 404
app.use((req, res, next) => {
  const mesg = `${req.url} is not a known service request in CQAT`,
    result = { success: false, mesg },
    err = new Error(result);

  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  const result = err;

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  if (!err.status) {
    result.mesg = `Server error processing service ${req.url}, error = ${err.message}`;
  }
  res.send(result);
});

app.listen(port, () => console.log(`INFO: REST server now listening on port ${port}`));
