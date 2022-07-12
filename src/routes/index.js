const todoRoutes = require('./todos')
const todoItemRoutes = require('./todoitems')
const userRoutes = require('./users')

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

  todoRoutes(app)
  todoItemRoutes(app)
  userRoutes(app)
}
