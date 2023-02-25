const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true
    },
    email: {
        type: String,
        required: [true, 'Require'],
        unique: true,
        //match: []
       
    },
    thought: [
        {
          type: Schema.Types.ObjectId,
          ref: 'thought',
        },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
      getters: true
    },
    id: false,
  }
);


const User = model('user', userSchema);

module.exports = User;