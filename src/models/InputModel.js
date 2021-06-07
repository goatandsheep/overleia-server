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
};
