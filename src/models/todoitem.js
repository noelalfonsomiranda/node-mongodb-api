const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const TodoItemSchema = new Schema({
  content: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  todo_id: {
    type: Schema.Types.ObjectId,
    ref: 'Todo'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('TodoItem', TodoItemSchema)
