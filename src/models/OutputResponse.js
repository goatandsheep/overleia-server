import { v4 } from 'uuid';

const OutputModel = {
  id: {
    type: String,
    hashKey: true,
    default: v4,
  },
  name: {
    type: String,
    required: true,
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
    rangeKey: true,
    default: 'In Progress',
  },
  templateId: {
    type: String,
    required: true,
  },
  updatedDate: {
    type: Date,
    default: () => new Date(),
  },
};

export default OutputModel;
