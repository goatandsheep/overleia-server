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
  // adding status 549
  status: {
    type: String,
    enum: [
      'In Progress',
      'Cancelled',
      'Complete',
    ],
    default: 'In Progress'
  },

};
