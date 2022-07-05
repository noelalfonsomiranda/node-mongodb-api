const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  items: [
    {
      type: Schema.Types.ObjectId,
      ref: 'TodoItem'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Todo', TodoSchema)
