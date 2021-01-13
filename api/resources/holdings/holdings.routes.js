const express = require('express')
const { v4: uuidv4 } = require('uuid')
const _ = require('underscore')
const logger = require('./../../../utils/logger')
const passport = require('passport')

const holdingsValidate = require('./holdings.validate')

const jwtAuthenticate = passport.authenticate('jwt', { session: false })
const holdings = require('./../../../database').holdings
const holdingsRouter = express.Router()


holdingsRouter.get('/', (req, res) => {
  res.json(holdings)
})

holdingsRouter.post('/', [jwtAuthenticate, holdingsValidate], (req, res) => {
  let newHolding = {
    ...req.body, 
    id: uuidv4(),
    owner: req.user.username
  }
  
  holdings.push(newHolding)
  logger.info("Holding created added to the wallet", newHolding)
  res.status(201).json(newHolding)
})

holdingsRouter.get('/:id', (req, res) => {
  for(let holding of holdings){
    if(holding.id == req.params.id){
      res.json(holding)
      return
    }
  }

  // Not found 
  res.status(404).send(`The holding with id ${res.params.id} does not exist.`)
})


holdingsRouter.put('/:id', [jwtAuthenticate, holdingsValidate], (req, res) => {
  let holdingUpdated = {
    ...req.body,
    id: req.params.id, 
    owner: req.user.username
  }


  let index = _.findIndex(holdings, holding => holdingUpdated.id == id)

  if(index !== -1){
    if(holdings[index].owner !== holdingsValidate.owner){
      logger.info(`User ${req.user.username} is not the owner of ${holdingUpdated.id} holding.`)
      res.status(401).send(`You are not the holding owner. Only can SEE your own holdings.`)
      return
    }
    holdings[index] = holdingUpdated
    logger.info(`Product id ${holdingUpdated} was updated.`)
    res.status(200).json(holdingUpdated)
  } else {
    res.status(404).send(`The holding with id ${holdingUpdated.id} does not exist.`)
  }
})


holdingsRouter.get('/:id', jwtAuthenticate, (req, res) => {
  let index = _.findIndex(holdings, holding => holding.id == req.params.id)
  
  if(index === -1){
    logger.warn(`Holding id ${id} does not exist. Nothing to delete.`)
    res.status(404).send(`Holding with id ${req.params.id} does not exist.`)
    return 
  }

  if(holdings[index].owner !== req.user.username){
    logger.info(`User ${req.user.username} is not the owner of ${holdings[index].id} holding.`)
    res.status(401).send(`You are not the holding owner. Only can DELETE your own holdings.`)
    return
  }

  logger.info(`Product id ${req.params.id} was deleted.`)

  let deleted = holdings.splice(index, 1)
  res.status(200).json(deleted)
})

module.exports = holdingsRouter