var express = require('express')
var request = require('request')
var url = require('url')
var parseString = require('xml2js').parseString
var products = require('../lib/products')
var auth = require('../lib/auth')
var router = express.Router()

var LOGIN_URL = 'https://rentoys.xyz/index.php/rest/V1/integration/customer/token'
var USER_PROFILE_URL = 'https://rentoys.xyz/index.php/rest/V1/customers/me'

router.post('/login/email', function (req, res, next) {

  var creds
  for (var i in req.body){
    creds = JSON.parse(i)
  }
  
  var username = creds.email
  var password = creds.password
  auth.gettoken_login_with_email(username, password, function (access_token) {
    auth.user_profile(access_token, function (data) {
      res.json(data)
    })
  })
})

router.get('/users/:user_id', function (req, res) {
  var auth_header = req.header('Authorization')
  var token = auth_header.split(' ')[1]
  auth.user_profile(token, function (data) {
    if (data.id === parseInt(req.params.user_id)){
      res.json(data)
    }
    else{
      res.send({'status': 503})
    }
  })
})
module.exports = router