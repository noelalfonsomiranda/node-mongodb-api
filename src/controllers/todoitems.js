const TodoItemModel = require('../models/todoitem')
const TodoModel = require('../models/todo')

const NOT_FOUND = 'TodoItem Not Found'

module.exports = {
  async createTodoItem (req, res) {
    await TodoItemModel.create({
      content: req.body.content,
      todo_id: req.params.todoId
    })
      .then((todoItem) => {
        TodoModel.findOne(
          { _id: req.params.todoId },
          (err, todo) => {
            if (err) return res.send(err) // handles error first
            // check if todo exist
            if (!todo || !todoItem?.todo_id || !todoItem.todo_id.equals(req.params.todoId)) { return res.json({ success: false, message: 'Todo Not Found' }) }

            // execute when todo exist
            TodoModel.findOneAndUpdate(
              req.params.todoId,
              { $push: { items: todoItem._id } },
              { new: true, useFindAndModify: false },
              (err, todo) => {
                if (err) return res.send(err) // handles error first
                res.send(todoItem)
              }
            )
          }
        )
      })
      .catch((err) => res.send(err))
  },
  updateTodoItem (req, res) {
    TodoItemModel.findOneAndUpdate(
      { _id: req.params.todoItemId },
      {
        $set: {
          content: req.body.content,
          completed: req.body.completed
        }
      },
      { new: true },
      (err, todo) => {
        if (err) return res.send(err) // handles error first
        if (!todo) return res.json({ success: false, message: NOT_FOUND })
        res.json(todo)
      }
    )
  },
  async deleteTodoItem (req, res) {
    await TodoItemModel.deleteOne({ _id: req.params.todoItemId })
      .then(todoItem => {
        if (!todoItem.deletedCount) return res.json({ success: false, message: NOT_FOUND })

        TodoModel.findOneAndUpdate(
          { _id: req.params.todoId },
          { $pull: { items: { $in: [req.params.todoItemId] } } },
          { new: true, useFindAndModify: false },
          (err, todo) => res.json({
            success: true,
            message: `TodoItem ${req.params.todoItemId} Deleted`
          })
        )
      })
      .catch((err) => res.send(err))
  }
}
