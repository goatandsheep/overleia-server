import * as dynamoose from 'dynamoose';

const { Schema } = dynamoose;

dynamoose.Promise = global.Promise;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  roles: {
    type: Array,
    required: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const User = dynamoose.model(
  'testUserTable',
  userSchema,
);
export default User;
