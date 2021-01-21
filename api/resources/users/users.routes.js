const express = require('express')
const logger = require('./../../../utils/logger')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const usersValidation = require('./users.validate').usersValidation
const loginValidation = require('./users.validate').loginValidation
const config = require('./../../../config')
const userController = require('./users.controller')
const processErrors = require('../../libs/errorHandler').processErrors

const { UserDataInUse, IncorrectCredentials} = require('./users.error')

const usersRouter = express.Router()

function bodyToLowercase(req, res, next) {
  req.body.username && (req.body.username = req.body.username.toLowerCase())
  req.body.email && (req.body.email = req.body.email.toLowerCase())
  next()
}

usersRouter.get('/', processErrors((req, res) => {
  userController.getUsers()
    .then(users => {
      res.json(users)
    })
}))

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
            res.status(201).send('User created successfully', newUser)
          })
    })
}))


usersRouter.post('/login', [loginValidation, bodyToLowercase], processErrors(async (req, res) => {
  const userNoAuthenticated = req.body 
  let userRegistered 

  userRegistered = await userController.getUser({
    username: userNoAuthenticated.username
  })

  if(!userRegistered){
    logger.info(`User ${userNoAuthenticated.username} does not exist.`)
    throw new IncorrectCredentials();
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
      res.status(200).json({ token })
  } else {
      logger.info(`User ${userNoAuthenticated.username} does not authenticated auth. Password not correct.`);
      throw new IncorrectCredentials();
  }
}))


module.exports = usersRouter