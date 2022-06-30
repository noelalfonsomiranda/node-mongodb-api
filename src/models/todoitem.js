const mongoose = require('mongoose')

const TodoItemSchema = new mongoose.Schema({
  content: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  todo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('TodoItem', TodoItemSchema)
