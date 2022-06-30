const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TodoItem'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Todo', TodoSchema)
