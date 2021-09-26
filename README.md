# spotify-track-artist

Creates a database of Spotify tracks and artists.  Creates a set of REST services for adding tracks and querying the database populated from the Spotify API.

## INSTALL

1. `sqlite3` should be installed somewhere on your system.  For Mac users:  if it's not already present at 
`/usr/bin/sqlite3`, try installing with [HomeBrew](https://formulae.brew.sh/formula/sqlite).
2. Choose a location for your Sqlite3 DB file.  You can bring one into existnece simply with `sqlite3 myDB.db` and quitting (type`.quit`).
3. In the file `config/config.json` update the value for the `storage` key to the absolute path of your sqlite3 DB file.
4. Create a `.env` file in the root of the project.  The expected contents are in a later section.
5. Build the project: `npm i`
6. Create the database tables: `npm run migrate`

## RUNNING

1. Start the REST server:  npm run server
2. Test the queries with your favorite app (Postman, Curl, etc.)

## Database Manipulation

To restore the DB to it's blank state: `npm run migrate:undo`

To seed the data with tracks and artists to explore with REST services:  `npm run seed`

To remove the seed data (this will remove all track and artist data): `npm run seed:undo`

## REST Endpoints

| path | method | query params | body params | 
|------|------- | ------------ | ----------- | 
| /api/add-track | POST | | ISRC (string)<br>idx<strong>*</strong> (int) | 
| /api/search-artist | GET | q (string) artist substring search term | |
| /api/search-isrc | GET | q (string) an exact ISRC | |
| /api/search-song | GET | q (string) song substring search term | |

&#42; *Spotify returns a track with an array of several items, idx is the index (0 to n-1) to be used.*

## The .env File
| Key      | Value |
| ----------- | ----------- |
| STORAGE      | Absolute path to a sqlite3 database file       |
| SPOTIFY_AUTH   | Basic \<base64 string\><br/> The base64 string should adhere to the requirmebts from the *Authorization Code Flow* section of the [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/), namely: `client_id:client_secret`|
| SPOTIFY_BASE_AUTH_URL | `https://accounts.spotify.com/` |
| SPOTIFY_BASE_URL | `https://api.spotify.com/` |
| SPOTIFY_TOKEN_ENDPOINT | `api/token` |
| SPOTIFY_SEARCH_ENDPOINT | `v1/search` |
| PORT | Defaults to `5000` or set to your choice |
