const { Schema, model } = require('mongoose');
const reactionSchema = require('./Reaction');
const moment = require('moment');

// Schema to create Thought model
const thoughtSchema = new Schema(
  {
    thoughtText: {
      type: String,
      required: true,
      max_length: 200,
    },
   createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      max_length: 50,
      get: createdAtVal => moment (createdAtVal).format("MMM DD, YYYY [at] hh:mm a")
    },
    startDate: {
        type: Date,
        default: Date.now(),
    },
      endDate: {
        type: Date,
        default: () => new Date(+new Date() + 84 * 24 * 60 * 60 * 1000),
      },
      
    username: {
      type: String,
      required: true,
      max_length: 20,
    },
    reaction: [reactionSchema],
  },
  {
    toJSON: {
      getters: true,
    },
  }
);

const Thought = model('thought', thoughtSchema);

module.exports = Thought;
