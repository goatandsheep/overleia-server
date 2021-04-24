import { v4 } from 'uuid';

const ElementResponse = {
  id: {
    hashKey: true,
    type: Number,
    default: v4,
  },
  elementType: {
    type: String,
    required: true,
  },
  elementName: {
    type: String,
    faker: 'system.fileName',
    required: true,
  },
  creationDate: {
    type: Date,
    default: () => new Date(),
  },
  updatedDate: {
    type: Date,
    default: () => new Date(),
  },
  status: {
    type: String,
    enum: [
      'In Progress',
      'Cancelled',
      'Complete',
    ],
    default: 'In Progress',
  },
};

export default ElementResponse;
