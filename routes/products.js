var express = require('express');
var request = require('request')
var parseString = require('xml2js').parseString;
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

router.get('/4/shops', function(req, res){
  var URL = "http://77.93.198.186/4/shops"
  request(URL, function (err, response, body) {
    var response = JSON.parse(body)
    res.json(response)
  })
})

router.get('/hello', function (req, res) {
  request('http://d3u6s2iyc5cpge.cloudfront.net/products_dev.xml', function (err, response, body) {
    parseString(body, function (err, result) {
      console.dir(result);
    });
  })
})

module.exports = router;