const uuid = require('uuid');

module.exports = {
  id: {
    type: String,
    hashKey: true,
    default: uuid.v4,
  },
  file: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'In Progress',
      'Cancelled',
      'Complete',
    ],
    default: 'In Progress',
  },
  // add file size 580
  size: {
    type: Number,
  },
  // seconds
  time: {
    type: Number,
  },
};
