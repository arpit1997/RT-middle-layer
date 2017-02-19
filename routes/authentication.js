var express = require('express')
var request = require('request')
var url = require('url')
var parseString = require('xml2js').parseString
var products = require('../lib/products')
var router = express.Router()

var LOGIN_URL = "https://rentoys.xyz/index.php/rest/V1/integration/customer/token"

router.post('/login/email', function(req, res, next){
  var username = req.body.username
  var password = req.body.password
  console.log(username, password)
  options = {
    url: LOGIN_URL,
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    json: {
      username: username,
      password: password
    }
  }
  request(options, function (err, response, body) {
    if (!err){
      var json_obj = {
        access_token: body
      }
      res.json(json.stringify(json_obj))
    }
    else{
      res.json(err)
    }
  })
})

module.exports = router