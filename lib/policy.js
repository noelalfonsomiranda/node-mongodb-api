const JWTService = require('../middleware/auth')

// usually: "Authorization: Bearer [token]" or "token: [token]"
module.exports = (req, res, next) => {
  let token

  if (req.header('Authorization')) {
    const parts = req.header('Authorization').split(' ')

    if (parts.length === 2) {
      const scheme = parts[0]
      const credentials = parts[1]

      if (/^Bearer$/.test(scheme)) {
        token = credentials
      } else {
        return res.status(401).json({ message: 'Format for Authorization: Bearer [token]' })
      }
    } else {
      return res.status(401).json({ message: 'Format for Authorization: Bearer [token]' })
    }
  } else if (req.body.token) {
    token = req.body.token
    delete req.query.token
  } else {
    return res.status(401).json({ message: 'No Authorization was found' })
  }

  return JWTService.verify(token, (err, thisToken) => {
    if (err) return res.status(401).json({ err })
    req.token = thisToken
    return next()
  })
}

// USAGE
// const auth = require('./src/utils/policy');
// Bring in defined Passport Strategy
// require('./src/middleware/passport')(passport);
// secure your private routes with jwt authentication middleware
// app.all('/api/*', (req, res, next) => auth(req, res, next));
