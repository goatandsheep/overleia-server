module.exports = {
  elementType: {
    type: 'string',
    enum: [
      'video',
      'music',
    ],
    required: true,
  },
  elementName: {
    type: 'string',
    faker: 'system.fileName',
    required: true,
  },
  uuid: {
    type: 'string',
    faker: 'random.uuid',
  },
  creationDate: {
    type: 'string',
    faker: 'date.past',
  },
  updatedDate: {
    type: 'string',
    faker: 'date.past',
  },
  status: {
    type: 'string',
    enum: [
      'In Progress',
      'Cancelled',
      'Complete',
    ],
  },
};
