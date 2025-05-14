// backend/utils/eventEmitter.js
const EventEmitter = require('events');
const modelEvents = new EventEmitter();

module.exports = { modelEvents };