
const todoItemsController = require('./controllers').todoItems

module.exports = (app) => {
  app.post('/api/todos/:todoId/items', todoItemsController.createTodoItem)
  app.put('/api/todos/:todoId/items/:todoItemId', todoItemsController.updateTodoItem)
  app.delete('/api/todos/:todoId/items/:todoItemId', todoItemsController.deleteTodoItem)
  // For any other request method on todo items, we're going to return "Method Not Allowed"
  app.all('/api/todos/:todoId/items', (req, res) =>
    res.status(405).send({
      message: 'Method Not Allowed'
    }))
}