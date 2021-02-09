const uuid = require('uuid');

module.exports = {
  id: {
    type: String,
    hashKey: true,
    default: uuid.v4,
  },
  height: {
    type: Number,
    required: true,
    default: 720,
  },
  views: {
    type: Array,
    schema: [{
      type: Object,
      schema: {
        height: {
          type: Number,
          required: true,
        },
        width: {
          type: Number,
        },
        x: {
          type: Number,
          required: true,
        },
      },
    }],
  },
  name: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
  },
};
