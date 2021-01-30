module.exports = {
  id: 'ElementListResponse',
  type: 'object',
  properties: {
    total: {
      type: 'integer',
      minimum: 25,
      maximum: 100,
    },
    elements: {
      type: 'array',
      minItems: 13,
      maxItems: 35,
      items: {
        $ref: 'Element',
      },
    },
  },
  required: [
    'total',
    'elements',
  ],
};
