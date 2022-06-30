const bcrypt = require('bcrypt')
const User = require('../models/user')

const { hash, comparePassword } = require('../services/bcrypt.service')
// const authService = require('../services/auth.service')
const { issue, verify } = require('../services/auth.service')
const { sendMail } = require('../services/email.service')
const { generateCode } = require('../services/randomString.service')

module.exports = {
  async register (req, res) {
    const { firstName, lastName, email, password } = req.body

    try {
      const existingUser = await User.findOne({
        email
      })
      if (existingUser) {
        // throw new Error("User exists already.");
        return res.json({ success: false, message: 'User exists already.' })
      }
      const hashedPassword = await hash(password, 10)
      const inviteCode = await generateCode()
      await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        inviteCode
      })
        .then(async (user) => {
          try {
            const verificationToken = issue({
              payload: {
                email
              }
            })

            const data = {
              from: 'hello@test.com',
              to: email,
              subject: 'Email Verification',
              text: `
              Here's the link to verify your account.
              ${process.env.APP_BASE_URL}/verify-email?token=${verificationToken}
              `
            }

            await sendMail(data)

            return res.status(200).json({
              success: true,
              message: 'Successfully registered user',
              data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
              }
            })
          } catch (error) {
            return next(error)
          }
        })

      // res.json({
      //   user: {
      //     firstName: user.firstName,
      //     lastName: user.lastName,
      //     email: user.email
      //   },
      // });
    } catch (err) {
      res.json({ status: 500, message: 'Invalid email', error: err })
    }
  },

  async verifyUserEmail (req, res, next) {
    try {
      const { email } = verify(req.query.token)

      const user = await User.findOne({ email })

      if (user.emailVerified) {
        throw 'User already verified'
      }

      user.emailVerified = true

      await user.save()

      return res.status(200).json({
        success: true,
        message: 'Email successfully verified'
      })
    } catch (err) {
      // return next(err)
      return res.send(err)
    }
  },

  async login (req, res) {
    const { email, password } = req.body

    try {
      const user = await User.findOne({
        email
      })

      if (!user || !user?.emailVerified) {
        return res.status(404).json({
          status: 404,
          message: 'User does not exists or not yet verified'
        })
      }

      const isPasswordValid = await comparePassword(password, user.password)

      const {
        firstName,
        lastName,
        emailVerified,
        role,
        _id
      } = user

      const payload = {
        firstName,
        lastName,
        emailVerified,
        role,
        email,
        _id
      }

      const token = issue({
        payload,
        expiration: '12h'
      })

      if (isPasswordValid) {
        return res.status(200).json({
          success: true,
          message: 'Successfully login',
          token,
          data: payload
        })
      } else {
        return res.json({ status: 404, user: false })
      }
    } catch (err) {
      res.json({ status: 500, message: 'Invalid login' })
    }
  },

  validate (req, res, next) {
    try {
      const { token } = req.body
      const verifyToken = verify(token)
      return res.status(200).json({
        success: true,
        message: 'Successfully verified',
        data: verifyToken
      })
    } catch (error) {
      return next(error)
    }
  },

  async getUserList (req, res) {
    // get all users
    const users = await User.find()

    if (!users) {
      return res.json({ status: 'error', message: 'No users found' })
    }
    res.json({ status: 200, users })
  },

  async getUser (req, res) {
    await User.findOne({ _id: req.params.userId })
      .then((user) => {
        if (!user) return res.json({ success: false, message: 'No users found' })
        res.send(user)
      })
      .catch((err) => res.send(err))
  },

  async updateUser (req, res) {
    const {
      email,
      password,
      firstName,
      lastName
    } = req.body
    const userId = req.params.userId
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await User.findByIdAndUpdate(userId, {
        $set: {
          email,
          password: hashedPassword,
          firstName,
          lastName
        }
      })
      if (!user) {
        return res.json({ status: 404, message: 'Invalid user' })
      }
      res.json({ status: 200, message: 'User successfully updated' })
    } catch (err) {
      res.json({ status: 500, message: 'Invalid user' })
    }
  },

  async deleteUser (req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.userId)
      if (!user) {
        return res.json({ status: 404, message: 'Invalid user' })
      }
      res.json({ status: 200, user })
    } catch (err) {
      res.json({ status: 500, message: 'Invalid user' })
    }
  }
}
