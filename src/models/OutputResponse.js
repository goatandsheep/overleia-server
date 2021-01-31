module.exports = {
  name: {
    type: String,
    faker: 'random.words',
    required: true,
  },
  creationDate: {
    type: Date,
  },
  inputs: {
    type: 'array',
    minItems: 1,
    maxItems: 4,
    items: {
      type: String,
      faker: 'random.uuid',
    },
    required: true,
  },
  status: {
    type: String,
    enum: [
      'In Progress',
      'Cancelled',
      'Complete',
    ],
  },
  templateId: {
    type: String,
    faker: 'random.uuid',
    required: true,
  },
  updatedDate: {
    type: Date,
  },
  uuid: {
    type: String,
    faker: 'random.uuid',
  },
};
