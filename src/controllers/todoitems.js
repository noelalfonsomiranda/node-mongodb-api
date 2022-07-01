const TodoItemModel = require('../models/todoitem')
const TodoModel = require('../models/todo')

const NOT_FOUND = 'TodoItem Not Found'

module.exports = {
  async createTodoItem (req, res, next) {
    await TodoItemModel.create({
      content: req.body.content,
      todo_id: req.params.todoId
    })
      .then((todoItem) => {
        TodoModel.findOne(
          { _id: req.params.todoId },
          (err, todo) => {
            if (err) return res.status(400).send(err) // handles error first
            // check if todo exist
            if (!todo || !todoItem?.todo_id || !todoItem.todo_id.equals(req.params.todoId))
              return res.status(404).json({ success: false, message: 'Todo Not Found' })

            // execute when todo exist
            TodoModel.findOneAndUpdate(
              { _id: req.params.todoId },
              { $push: { items: todoItem._id } },
              { new: true, useFindAndModify: false },
              (err, todo) => {
                if (err) return res.status(400).send(err) // handles error first
                res.status(200).send(todoItem)
              }
            )
          }
        )
      }).catch(err => next(err))
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
      // (err, todo) => {
      //   if (err) return res.send(err) // handles error first
      //   if (!todo) return res.json({ success: false, message: NOT_FOUND })
      //   res.json(todo)
      // }
    ).then(todo => {
      if (!todo) return res.status(404).json({ success: false, message: NOT_FOUND })
      res.status(200).send(todo)
    }).catch(err => next(err))
  },
  async deleteTodoItem (req, res, next) {
    await TodoItemModel.deleteOne({ _id: req.params.todoItemId })
      .then(todoItem => {
        if (!todoItem.deletedCount) return res.status(404).json({ success: false, message: NOT_FOUND })

        TodoModel.findOneAndUpdate(
          { _id: req.params.todoId },
          { $pull: { items: { $in: [req.params.todoItemId] } } },
          { new: true, useFindAndModify: false },
          () => res.status(200).json({
            success: true,
            message: `TodoItem ${req.params.todoItemId} Deleted`
          })
        )
      }).catch((err) => next(err))
  }
}
