const Joi = require('joi')

const holdingSchema = Joi.object({
  company: Joi.string().max(100),
  symbol: Joi.string().max(6).uppercase().required(),
  shares: Joi.number().positive().required(),
  priceBuy: Joi.number().positive().precision(2).required(),
  priceSell: Joi.number().positive().precision(2),
  dateBuy: Joi.date().timestamp(),
  dateSell: Joi.date().timestamp(),
  isActive: Joi.boolean(),
  createdAt: Joi.date().timestamp(),
  updatedAt: Joi.date().timestamp()
})

module.exports = (req, res, next) => {
  const data = req.body
  let validation = holdingSchema.validate(data, {
    abortEarly: false, 
    convert: false
  })
  if (validation.error === undefined){
    next()
  } else {
   
    let validationErrors = validation.error.details.reduce((acumulator, error) => {
      return acumulator + `[${error.message}]`;
    }, '')
    res.status(400).send('...error on holding validation')
  }
}

