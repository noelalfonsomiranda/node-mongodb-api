const todosController = require('./controllers').todos
const todoItemsController = require('./controllers').todoItems
const usersController = require('./controllers').users

module.exports = (app) => {
  // middleware to use for all requests
  app.use((req, res, next) => {
    console.log('Something is happening.')
    next() // make sure we go to the next routes and don't stop here
  })

  app.get('/api', (req, res) => res.status(200).send({
    success: true,
    message: 'Welcome to the API route!'
  }))

  // user routes
  app.post('/register', usersController.register)
  app.get('/verify-email', usersController.verifyUserEmail)
  app.post('/login', usersController.login)
  app.post('/validate', usersController.validate)

  app.get('/api/users', usersController.getUserList)
  app.get('/api/users/:userId', usersController.getUser)
  app.put('/api/users/:userId', usersController.updateUser)
  app.delete('/api/users/:userId', usersController.deleteUser)

  // todo routes
  app.post('/api/todos', todosController.createTodo)
  app.get('/api/todos', todosController.getTodoList)
  app.get('/api/todos/:todoId', todosController.getTodo)
  app.put('/api/todos/:todoId', todosController.updateTodo)
  app.delete('/api/todos/:todoId', todosController.deleteTodo)
  app.get('/api/todos/:todoId/items', todosController.getTodoWithPopulatedItems)

  // todoitem routes
  app.post('/api/todos/:todoId/items', todoItemsController.createTodoItem)
  app.put('/api/todos/:todoId/items/:todoItemId', todoItemsController.updateTodoItem)
  app.delete('/api/todos/:todoId/items/:todoItemId', todoItemsController.deleteTodoItem)
  // For any other request method on todo items, we're going to return "Method Not Allowed"
  app.all('/api/todos/:todoId/items', (req, res) =>
    res.status(405).send({
      message: 'Method Not Allowed'
    }))
}
