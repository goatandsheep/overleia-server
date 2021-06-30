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
  progress: {
    type: Number,
  },
  errorlog: {
    type: String,
  },
  creationDate: {
    type: Date,
    default: () => new Date(),
  },
  inputs: {
    type: Array,
    schema: [String],
    required: true,
    validate: (val) => val.length > 0,
  },
  status: {
    type: String,
    enum: [
      'In Progress',
      'Cancelled',
      'Complete',
    ],
    index: {
      name: 'statusIndex',
      global: true,
    },
    default: 'In Progress',
  },
  templateId: {
    type: String,
  },
  type: {
    type: String,
    enum: [
      'Overleia',
      'BeatCaps',
    ],
    required: true,
    default: 'Overleia',
  },
  updatedDate: {
    type: Date,
    default: () => new Date(),
  },
  owner: {
    type: String,
    required: true,
  },
  // add file size 580
  size: {
    type: Number,
  },
};
