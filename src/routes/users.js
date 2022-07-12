const usersController = require('./controllers').users

module.exports = (app) => {
  app.post('/register', usersController.register)
  app.get('/verify-email', usersController.verifyUserEmail)
  app.post('/login', usersController.login)
  app.post('/validate', usersController.validate)

  app.get('/api/users', usersController.getUserList)
  app.get('/api/users/:userId', usersController.getUser)
  app.put('/api/users/:userId', usersController.updateUser)
  app.delete('/api/users/:userId', usersController.deleteUser)
}