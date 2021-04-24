import { v4 } from 'uuid';

const InputModel = {
  id: {
    type: String,
    hashKey: true,
    default: v4,
  },
  file: {
    type: String,
    required: true,
  },
};

export default InputModel;
