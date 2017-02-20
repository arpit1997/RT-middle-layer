var express = require('express')
var request = require('request')
var url = require('url')
var parseString = require('xml2js').parseString
var products = require('../lib/products')
var router = express.Router()

var LOGIN_URL = 'https://rentoys.xyz/index.php/rest/V1/integration/customer/token'
var USER_PROFILE_URL = 'https://rentoys.xyz/index.php/rest/V1/customers/me'

router.post('/login/email', function (req, res, next) {
  var username = req.body.username
  var password = req.body.password
  console.log(username, password)
  options = {
    url: LOGIN_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    json: {
      username: username,
      password: password
    }
  }
  request(options, function (err, response, body) {
    var access_token = body
    console.log(access_token)
    options = {
      url: USER_PROFILE_URL,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      }
    }
    request(options, function (err, reponse, body) {
      if (!err) {
        var user_profile = JSON.parse(body)
        console.log(user_profile)
        var json_obj = {
          'id': parseInt(user_profile.id),
          'remote_id': parseInt(user_profile.gorup_id),
          'fb_id': null,
          'access_token': user_profile.access_token,
          'name': user_profile.firstname + ' ' + user_profile.lastname,
          'street': user_profile.addresses[0].street[0],
          'city': user_profile.addresses[0].city,
          'house_number': '',
          'zip': user_profile.addresses[0].postcode,
          'email': user_profile.email,
          'phone': user_profile.addresses[0].telephone,
          'gender': null
        }
        res.setHeader('Content-Type', 'application/json')
        res.json(json_obj)
      }
      else {
        res.json(err)
      }
    })

  })
})

router.get('/users/:user_id', function (req, res) {
  var auth_header = req.header('Authorization')
  var token = auth_header.split(' ')[1]
  options = {
    url: USER_PROFILE_URL,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  }
  request(options, function (err, reponse, body) {
    if (!err) {
      var user_profile = JSON.parse(body)
      console.log(user_profile)
      var json_obj = {
        'id': parseInt(user_profile.id),
        'remote_id': parseInt(user_profile.gorup_id),
        'fb_id': null,
        'access_token': user_profile.access_token,
        'name': user_profile.firstname + ' ' + user_profile.lastname,
        'street': user_profile.addresses[0].street[0],
        'city': user_profile.addresses[0].city,
        'house_number': '',
        'zip': user_profile.addresses[0].postcode,
        'email': user_profile.email,
        'phone': user_profile.addresses[0].telephone,
        'gender': null
      }
      res.setHeader('Content-Type', 'application/json')
      res.json(json_obj)
    }
    else {
      res.json(err)
    }
  })
})
module.exports = router