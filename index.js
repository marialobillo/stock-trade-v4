const express = require('express')
const holdingsRouter = require('./api/resources/holdings/holdings.routes')
const usersRouter = require('./api/resources/users/users.routes')
const morgan = require('morgan')
const logger = require('./utils/logger')
const auth = require('./api/libs/auth')

const passport = require('passport')
// Authentication basic password and usernem
const BasicStrategy = require('passport-http').BasicStrategy
passport.use(new BasicStrategy(auth))

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('short', {
  stream: {
    write: message => logger.info(message.trim())
  }
}))



app.use(passport.initialize())

app.use('/holdings', holdingsRouter)
app.use('/users', usersRouter)


app.get('/', passport.authenticate('basic', { session: false }), (req, res) => {
  res.send('API de stock trade app')
})

app.listen(3000, () => {
  logger.info('Listening on port 3000')
})

