
var express = require('express')
var request = require('request')
var url = require('url')
var carts = require('../lib/carts')
var products = require('../lib/products')

var router = express.Router()

router.get('/cart', function (req, res, next) {
  var auth_header = req.header('Authorization')
  var token = auth_header.split(' ')[1]
  token = new Buffer(token, 'base64').toString('ascii')
  token = token.replace(/[^\w\s]/gi, '')
  console.log(token)
  carts.cart_items(token, function (data) {
    console.log(data)
    data = JSON.parse(data)
    carts.retrieve_product_sku(data, function (product_sku) {
      products.convert_product_data(0, 0, function (err, product_data) {
        products.get_category_wise_product(product_data, product_sku, function (cart_products) {
          carts.cart_details(token, function (cart_details) {
            carts.cart_info_items(cart_details, cart_products, data, function (cart) {
              res.json(cart)
            })
          })

        })
      })
    })
  })
})

router.get('/cart/info', function(req, res){
  var auth_header = req.header('Authorization')
  console.log(auth_header)
  var token = auth_header.split(' ')[1] 
  token = new Buffer(token, 'base64').toString('ascii')
  token = token.replace(/[^\w\s]/gi, '')
  carts.cart_info(token, function(data){
    console.log(data)
    res.json(data)
  })
  
})

router.post('/cart', function(req, res){
  console.log(req.body)
  var product_id = req.body.product_variant_id
  var auth_header = req.header('Authorization')
  var token = auth_header.split(' ')[1]
  var qty = 1
  console.log(token)
  token = new Buffer(token, 'base64').toString('ascii')
  token = token.replace(/[^\w\s]/gi, '')
  carts.cart_details(token, function(data){
    console.log(data)
    data = JSON.parse(data)
    var cart_id = data.id
    console.log(cart_id)
    products.fetch_single_product(product_id, function(err, item){
      if(err === null){
        console.log(item)
        var product_sku = item.sku
        carts.add_to_cart(token, cart_id, product_sku, function(data){
          console.log(data)
          res.json(data)
        })
      }
    })
  })
})
router.delete('/:shop_id/cart/:product_id', function(req, res){
  var product_id = req.params.product_id
  var auth_header = req.header('Authorization')
  var token = auth_header.split(' ')[1] 
  console.log(token)
  carts.delete_from_cart(token, product_id, function(err, data){
    if (!err){
      res.json(data)
    }
    else{
      res.send(err)
    }
  })
})
module.exports = router