module.exports = {
  id: 'Element',
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
  },
  required: [
    'elementType',
    'elementName',
  ],
};
