const uuid = require('uuid');

module.exports = {
  id: {
    hashKey: true,
    type: Number,
    default: uuid.v4,
  },
  elementType: {
    type: String,
    required: true,
  },
  elementName: {
    type: String,
    faker: 'system.fileName',
    required: true,
  },
  creationDate: {
    type: Date,
    default: Date,
  },
  updatedDate: {
    type: Date,
    default: Date,
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
};
