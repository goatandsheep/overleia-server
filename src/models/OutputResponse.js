const uuid = require('uuid');

module.exports = {
  id: {
    type: String,
    hashKey: true,
    default: uuid.v4,
  },
  name: {
    type: String,
    required: true,
  },
  creationDate: {
    type: Date,
    default: Date,
  },
  inputs: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'In Progress',
      'Cancelled',
      'Complete',
    ],
    rangeKey: true,
    default: 'In Progress',
  },
  templateId: {
    type: String,
    required: true,
  },
  updatedDate: {
    type: Date,
    default: Date,
  },
};
