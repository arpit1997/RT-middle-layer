var express = require('express')
var request = require('request')
var url = require('url')
var parseString = require('xml2js').parseString
var products = require('../lib/products')
var router = express.Router()

/* GET home page. */
router.get('/:shop_id/products', function (req, res, next) {
  var url_parts = url.parse(req.url, true)
  var limit = url_parts.query.limit
  var offset = url_parts.query.offset
  var category = url_parts.query.category
  console.log(limit)
  console.log(offset)
  console.log('hello')
  if (limit === undefined && offset === undefined) {
    limit = 8
    offset = 0
  }
  limit = parseInt(limit)
  offset = parseInt(offset)
  console.log(category)
  if (category !== undefined) {
    console.log('world')
    next()
  }
  else {
    category = parseInt(category)
    products.convert_product_data(limit, offset, function (err, converted_data) {
      if (err) {
        res.json({'status': '500'})
      }
      else {
        products.limit_data(converted_data, limit, offset, function (data) {
          res.json(data)
        })
      }
    })
  }

})

router.get('/:shop_id/products', function (req, res, next) {
  var url_parts = url.parse(req.url, true)
  var limit = url_parts.query.limit
  var offset = url_parts.query.offset
  var category = url_parts.query.category
  var sorting = url_parts.query.sort
  var records = []
  if (limit === undefined && offset === undefined) {
    limit = 8
    offset = 0
  }
  if (limit === undefined){
    limit = 8
  }
  limit = parseInt(limit)
  offset = parseInt(offset)
  products.convert_category_data(category, function (results) {
    products.retrieve_category_sku(results, function (category_sku) {
      products.convert_product_data(limit, offset, function (err, converted_data) {
        if (!err){
          products.get_category_wise_product(converted_data, category_sku, function (data) {
            products.limit_cat_data(data, limit, offset, category, function (cat_wise_data) {
              if (sorting === "price_ASC"){
                records = cat_wise_data.records
                records.sort(function (a,b) {
                  return parseFloat(a.price) > parseFloat(b.price)
                })
                cat_wise_data.records = records
                res.json(cat_wise_data)
              }
              else{
                if (sorting === "price_DESC"){
                  records = cat_wise_data.records
                  records.sort(function (a,b) {
                    return parseFloat(a.price) < parseFloat(b.price)
                  })
                  cat_wise_data.records = records
                  res.json(cat_wise_data)
                }
                else {
                  res.json(cat_wise_data)
                }
              }

            })
          })
        }
      })
    })
  })

})

router.get('/:shop_id/products/:product_id', function (req, res, next) {
  products.fetch_single_product(req.params.product_id, function (err, data) {
    if (err) {
      res.json({'status': '500'})
    }
    else {
      res.json(data)
    }
  })
})

router.get('/hello', function (req, res) {
  request('http://d3u6s2iyc5cpge.cloudfront.net/products_dev.xml', function (err, response, body) {
    parseString(body, function (err, result) {
      console.dir(result)
    })
  })
})

module.exports = router