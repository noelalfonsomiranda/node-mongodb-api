const bcrypt = require('bcrypt')
const {UserModel} = require('../models')


const { hash, comparePassword } = require('../middleware/bcrypt')
// const authService = require('../middleware/auth')
const { issue, verify } = require('../middleware/auth')
const { generateCode } = require('../middleware/randomString')
const { sendMail } = require('../services/email')

const {NOT_FOUND} = require('../constants')

module.exports = {
  async register (req, res, next) {
    const { firstName, lastName, email, password } = req.body

    try {
      const existingUser = await UserModel.findOne({
        email
      })
      if (existingUser) {
        // throw new Error("User exists already.");
        return res.status(400).json({ success: false, message: 'Email is already registered' })
      }
      const hashedPassword = await hash(password, 10)
      const inviteCode = await generateCode()
      await UserModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        inviteCode
      })
        .then(async (user) => {
          const verificationToken = issue({
            payload: {email}
          })
          const data = {
            from: 'hello@test.com',
            to: email,
            subject: 'Email Verification',
            text: `
            Here's the link to verify your account.
            ${process.env.APP_BASE_URL}/verify-email?token=${verificationToken}`
          }

          const sendEmailVerification = await sendMail(data)
          
          if (sendEmailVerification) {
            res.status(200).json({
              success: true,
              message: 'User successfully registered',
              data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
              }
            })
          }
        }).catch(err => next(err))

      // res.json({
      //   user: {
      //     firstName: user.firstName,
      //     lastName: user.lastName,
      //     email: user.email
      //   },
      // });
    } catch (err) {
      return next(err)
    }
  },

  async verifyUserEmail (req, res, next) {
    try {
      const { email } = verify(req.query.token)

      const user = await UserModel.findOne({ email })

      if (user.emailVerified) {
        throw 'Your account is already verified'
      }

      user.emailVerified = true

      await user.save()

      return res.status(200).json({
        success: true,
        message: 'Email successfully verified'
      })
    } catch (err) {
      return next(err)
    }
  },

  async login (req, res, next) {
    const { email, password } = req.body

    try {
      const user = await UserModel.findOne({email})

      if (!user || !user?.emailVerified) {
        return res.status(404).json({
          success: false,
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

      if (isPasswordValid)
        return res.status(200).json({
          success: true,
          message: 'Successfully login',
          token,
          data: payload
        })
      res.status(400).json({ success: false, message: "Invalid login details" })
    } catch (err) {
      return next(err)
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

  async getUserList (req, res, next) {
    // get all users
    await UserModel.find()
      .then(users => {
        if (!users) return res.status(404).json({ success: false, message: NOT_FOUND.USER })
        res.status(200).send(users)
      }).catch(err => next(err))
  },

  async getUser (req, res, next) {
    await UserModel.findOne({ _id: req.params.userId })
      .then(user => {
        if (!user) return res.status(404).json({ success: false, message: NOT_FOUND.USER })
        res.status(200).send(user)
      })
      .catch(err => res.send(err))
  },

  async updateUser (req, res, next) {
    const {
      email,
      password,
      firstName,
      lastName
    } = req.body
    const userId = req.params.userId
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await UserModel.findByIdAndUpdate(userId, {
        $set: {
          email,
          password: hashedPassword,
          firstName,
          lastName
        }
      })
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid user' })
      }
      res.status(200).json({ success: true, message: 'User successfully updated' })
    } catch (err) {
      return next(err)
    }
  },

  async deleteUser (req, res, next) {
    try {
      const user = await UserModel.findByIdAndDelete(req.params.userId)
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid user' })
      }
      res.status(200).json({
        success: true,
        message: `${user.email}: user successfully deleted`
      })
    } catch (err) {
      return next(err)
    }
  }
}
