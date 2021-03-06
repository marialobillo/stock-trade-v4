const express = require('express')
const logger = require('./../../../utils/logger')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const jwtAuthenticate = passport.authenticate('jwt', { session: false })

const usersValidation = require('./users.validate').usersValidation
const loginValidation = require('./users.validate').loginValidation
const config = require('./../../../config')
const userController = require('./users.controller')
const processErrors = require('../../libs/errorHandler').processErrors
const { UserDataInUse, WrongCredentials} = require('./users.error')

const usersRouter = express.Router()

function bodyToLowercase(req, res, next) {
  req.body.username && (req.body.username = req.body.username.toLowerCase())
  req.body.email && (req.body.email = req.body.email.toLowerCase())
  next()
}

usersRouter.get('/', processErrors((req, res) => {
  return userController.getUsers()
    .then(users => {
      res.json(users)
    })
}))

// Registration Route
usersRouter.post('/', [usersValidation, bodyToLowercase], processErrors((req, res) => {
  let newUser = req.body

  return userController.userExists(newUser.username, newUser.email)
    .then(userExists => {
      if(userExists){
        logger.warn(`Email ${newUser.email} or username ${newUser.username} already exist.`)
        throw new UserDataInUse()
      }

      return bcrypt.hash(newUser.password, 10) 
    })  
    .then((hash) => {
      return userController.createUser(newUser, hash)
          .then(newUser => {
            let token = jwt.sign(
              { id: newUser._id }, 
              config.jwt.secret, 
              { expiresIn: config.jwt.expirationTime })
            const returneredUser = hideSensitiveFields(newUser)
            res.status(201).send({user: returneredUser, token })
          })
    })
}))

// Login Route
usersRouter.post('/login', [loginValidation, bodyToLowercase], processErrors(async (req, res) => {
  const userNoAuthenticated = req.body 
  let userRegistered 

  userRegistered = await userController.getUser({
    username: userNoAuthenticated.username
  })

  if(!userRegistered){
    logger.info(`User ${userNoAuthenticated.username} does not exist.`)
    throw new WrongCredentials();
  }

  let correctPassword 
  correctPassword = await bcrypt.compare(userNoAuthenticated.password, userRegistered.password)

  if(correctPassword){
      // Generate and send token
      let token = jwt.sign(
          { id: userRegistered.id }, 
          config.jwt.secret, 
          { expiresIn: config.jwt.expirationTime })
      logger.info(`User ${userNoAuthenticated.username} completed authentication.`)

      const returneredUser = hideSensitiveFields(userRegistered)
      res.status(200).json({ token, user : returneredUser})
  } else {
      logger.info(`User ${userNoAuthenticated.username} does not authenticated auth. Password not correct.`);
      throw new WrongCredentials();
  }
}))

// Auth Route, get the User Authenticated by the Token
usersRouter.get('/whoami', [jwtAuthenticate], processErrors(async (req, res) => {
  res.json(req.user)
}))

const hideSensitiveFields = (user) => {
  return {
    _id: user._id || user.id,
    email: user.email, 
    username: user.username, 
    balance: user.balance
  }
}


module.exports = usersRouter