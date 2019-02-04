//Global Namespace
global.dbcache = [];

//Environment Variables
process.env.SOURCE = null;
process.env.CURDB = null;
process.env.CURDOC = null;

const connect = require('./mainfn').connect;
module.exports.connect = connect;

const doc = require('./mainfn').doc;
module.exports.doc = doc;

const insertOne = require('./mainfn').insertOne;
module.exports.insertOne = insertOne;

const insert = require('./mainfn').insert;
module.exports.insert = insert;

const fetchAll = require('./mainfn').fetchAll;
module.exports.fetchAll = fetchAll;

const fetch = require('./mainfn').fetch;
module.exports.fetch = fetch;

const update = require('./mainfn').update;
module.exports.update = update;

const remove = require('./mainfn').remove;
module.exports.remove = remove;