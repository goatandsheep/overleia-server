module.exports = {
  height: {
    type: Number,
    required: true,
  },
  views: {
    type: 'array',
    minItems: 2,
    maxItems: 4,
    items: {
      height: {
        type: 'integer',
        minimum: 80,
        maximum: 300,
        required: true,
      },
      width: {
        type: 'integer',
        minimum: 100,
        maximum: 500,
      },
      x: {
        type: 'integer',
        minimum: 10,
        maximum: 300,
        required: true,
      },
      y: {
        type: 'integer',
        minimum: 10,
        maximum: 200,
        required: true,
      },
    },
    required: true,
  },
  name: {
    type: 'string',
    faker: 'random.words',
    required: true,
  },
  width: {
    enum: [
      1280,
      1920,
      3840,
    ],
  },
  uuid: {
    type: 'string',
    faker: 'random.uuid',
  },
};
