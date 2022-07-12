const todosController = require('./controllers').todos

module.exports = (app) => {
  app.post('/api/todos', todosController.createTodo)
  app.get('/api/todos', todosController.getTodoList)
  app.get('/api/todos/:todoId', todosController.getTodo)
  app.put('/api/todos/:todoId', todosController.updateTodo)
  app.delete('/api/todos/:todoId', todosController.deleteTodo)
  app.get('/api/todos/:todoId/items', todosController.getTodoWithPopulatedItems)
}