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
        type: Number,
        minimum: 80,
        maximum: 300,
        required: true,
      },
      width: {
        type: Number,
        minimum: 100,
        maximum: 500,
      },
      x: {
        type: Number,
        minimum: 10,
        maximum: 300,
        required: true,
      },
      y: {
        type: Number,
        minimum: 10,
        maximum: 200,
        required: true,
      },
    },
    required: true,
  },
  name: {
    type: String,
    faker: 'random.words',
    required: true,
  },
  width: {
    type: Number,
  },
  uuid: {
    type: String,
    faker: 'random.uuid',
  },
};
