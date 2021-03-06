module.exports = (err, req, res, next) => {
  console.log(err)
  if (typeof err === 'string') {
    return res.status(400).json({ message: err, success: false })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message, success: false })
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(400).json({ message: 'Invalid Token.', success: false })
  }

  if (err.name === 'UnAuthenticatedError') {
    return res.status(401).json({ message: 'You are not authenticated.', success: false })
  }

  // return next(err)
  return res.status(400).json({ message: `Error: ${err.message}`, success: false })
}
