var request = require('request')
var url = require('url')

var LOGIN_URL = 'https://rentoys.xyz/index.php/rest/V1/integration/customer/token'
var USER_PROFILE_URL = 'https://rentoys.xyz/index.php/rest/V1/customers/me'

/**
 * This function requests magneto api and retrieves access token for given user
 * @param {String} email username of the provided user
 * @param {String} password password of the provided user
 * @param {function} callback callback function
 * @return {String} returns access token for user
 */
exports.gettoken_login_with_email = function (email, password, callback) {
  options = {
    url: LOGIN_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    json: {
      username: email,
      password: password
    }
  }
  request(options, function (err, response, body) {
    callback(body)
  })
}

/**
 * This function retrieves user profile using access token of user
 * @param {String} access_token access token of the user
 * @param callback callback function
 * @return {json} json_obj returns user profile in json format
 */
exports.user_profile = function (access_token, callback) {
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
      var json_obj = {
        'id': parseInt(user_profile.id),
        'remote_id': parseInt(user_profile.group_id),
        'fb_id': null,
        'access_token': access_token,
        'name': user_profile.firstname + ' ' + user_profile.lastname,
        'street': user_profile.addresses[0].street[0],
        'city': user_profile.addresses[0].city,
        'house_number': '',
        'zip': user_profile.addresses[0].postcode,
        'email': user_profile.email,
        'phone': user_profile.addresses[0].telephone,
        'gender': null
      }
      callback(json_obj)
    }
    else {
      callback(err)
    }
  })
}