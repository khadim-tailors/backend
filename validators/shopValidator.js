const validateRequest = require('../helper/validatorHelper');
const Shop = require('../Schema/Shop');

const validateShop = (req, res, next) => {
  validateRequest(req, res, next, Shop);
};
module.exports = validateShop;