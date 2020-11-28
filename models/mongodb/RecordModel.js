const mongoose = require('mongoose');

/**
 * schema declaration for records model
 */
const schema = new mongoose.Schema({
    key: String,
    value: String,
    counts: [Number],
    createdAt: Date
});

const Record = mongoose.model('Record', schema, 'records');

module.exports = Record;