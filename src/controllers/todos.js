const TodoModel = require('../models/todo')

const NOT_FOUND = 'Todo Not Found'

module.exports = {
  getTodoWithPopulatedItems: async (req, res, next) => {
    const { todoId } = req.params
    await TodoModel.findById(todoId).populate('items')
      .then((todo) => {
        if (!todo) return res.json({ success: false, message: NOT_FOUND })
        res.send(todo)
      })
      .catch(err => next(err))
  },
  async getTodoList (req, res, next) {
    await TodoModel.find()
      .then(todoList => res.send(todoList))
      .catch(err => next(err))
  },
  async getTodo (req, res, next) {
    await TodoModel.findOne({ _id: req.params.todoId })
      .then((todo) => {
        if (!todo) return res.json({ success: false, message: NOT_FOUND })
        res.send(todo)
      })
      .catch(err => next(err))
  },
  createTodo (req, res, next) {
    const todo = new TodoModel({
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed
    })

    todo.save()
      .then(() => res.json(todo))
      .catch(err => next(err))
  },
  updateTodo (req, res, next) {
    TodoModel.findOneAndUpdate(
      { _id: req.params.todoId },
      {
        $set: {
          title: req.body.title,
          description: req.body.description,
          completed: req.body.completed
        }
      },
      { new: true },
      // (err, todo) => {
      //   if (err) return res.send(err) // handles error first
      //   if (!todo) return res.json({ success: false, message: NOT_FOUND })
      //   res.send(todo)
      // }
    ).then(todo => {
      if (!todo) return res.json({ success: false, message: NOT_FOUND })
      res.send(todo)
    }).catch(err => next(err))
  },
  async deleteTodo (req, res, next) {
    await TodoModel.deleteOne({ _id: req.params.todoId })
      .then(todo => {
        if (!todo.deletedCount) return res.json({ success: false, message: NOT_FOUND })
        res.json({ success: true, message: `Todo ${req.params.todoId} Deleted` })
      })
      .catch(err => next(err))
  }
}
