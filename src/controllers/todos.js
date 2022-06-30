const TodoModel = require('../models/todo')

const NOT_FOUND = 'Todo Not Found'

module.exports = {
  getTodoWithPopulatedItems: async (req, res) => {
    const { todoId } = req.params
    const todo = await TodoModel.findById(todoId).populate('items')
    if (!todo) return res.json({ success: false, message: NOT_FOUND })
    res.send(todo)
  },
  getTodoList (req, res) {
    TodoModel.find((err, todos) => {
      if (err) return res.send(err)
      res.json(todos)
    })
  },
  async getTodo (req, res) {
    await TodoModel.findOne({ _id: req.params.todoId })
      .then((todo) => {
        if (!todo) return res.json({ success: false, message: NOT_FOUND })
        res.send(todo)
      })
      .catch((err) => res.send(err))
  },
  createTodo (req, res) {
    const todo = new TodoModel({
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed
    })

    todo.save((err, todo) => {
      if (err) return res.send(err)
      res.json(todo)
    })
  },
  updateTodo (req, res) {
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
      (err, todo) => {
        if (err) return res.send(err) // handles error first
        if (!todo) return res.json({ success: false, message: NOT_FOUND })
        res.send(todo)
      }
    )
  },
  async deleteTodo (req, res) {
    await TodoModel.deleteOne({ _id: req.params.todoId })
      .then((todo) => {
        if (!todo.deletedCount) return res.json({ success: false, message: NOT_FOUND })
        res.json({ success: true, message: `Todo ${req.params.todoId} Deleted` })
      })
      .catch((err) => res.send(err))
  }
}
