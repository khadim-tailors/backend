const Joi = require('joi');

const Shop = Joi.object({
  shopName: Joi.string().required(),
  phone: Joi.string().min(10).required(),
  email: Joi.string().email().required(),
  openAt: Joi.string().required(),
  closeAt: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip: Joi.string().required(),
  map: Joi.string().required(),
  city: Joi.string().required(),
});

module.exports = Shop;