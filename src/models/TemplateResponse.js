import { v4 } from 'uuid';

const TemplateModel = {
  id: {
    type: String,
    hashKey: true,
    default: v4,
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
        delay: {
          type: Number,
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

export default TemplateModel;
