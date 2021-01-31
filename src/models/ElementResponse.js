module.exports = {
  elementType: {
    type: String,
    enum: [
      'video',
      'music',
    ],
    required: true,
  },
  elementName: {
    type: String,
    faker: 'system.fileName',
    required: true,
  },
  uuid: {
    type: String,
    faker: 'random.uuid',
  },
  creationDate: {
    type: Date,
  },
  updatedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: [
      'In Progress',
      'Cancelled',
      'Complete',
    ],
  },
};
