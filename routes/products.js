var express = require('express');
var request = require('request')
var products = require('../lib/products')
var router = express.Router();

/* GET home page. */
router.get('/:shop_id/products', function(req, res, next) {
  var query_params = req.query;
  var param_limit = req.query.limit
  var param_offset = req.query.offset
  products.convert_product_data(param_limit, param_offset, function (err, data) {
    if (err){
      res.json({'status': '500'})
    }
    else {
      res.json(data)
    }
  })
});

module.exports = router;