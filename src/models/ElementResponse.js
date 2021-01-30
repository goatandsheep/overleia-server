module.exports = {
  id: 'ElementResponse',
  type: 'object',
  properties: {
    elementType: {
      type: 'string',
      enum: [
        'video',
        'music',
      ],
    },
    elementName: {
      type: 'string',
      faker: 'system.fileName',
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
  },
  required: [
    'elementType',
    'elementName',
    'uuid',
    'creationDate',
    'updatedDate',
    'status',
  ],
};
