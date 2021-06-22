const uuid = require('uuid');

module.exports = {
  id: {
    hashKey: true,
    type: Number,
    default: uuid.v4,
  },
  /*
  elementType: {
    type: String,
    required: true,
  },
  */
  type: {
    type: String,
    enum: [
      'Overleia',
      'BeatCaps',
    ],
    required: true,
    default: 'Overleia',
  },
  elementName: {
    type: String,
    faker: 'system.fileName',
    required: true,
  },
  creationDate: {
    type: Date,
    default: () => new Date(),
  },
  updatedDate: {
    type: Date,
    default: () => new Date(),
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
