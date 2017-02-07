var request = require('request')
var BASE_URL = 'http://voicebee.tk/index.php/rest/default/V1/products?'
var query_string = 'searchCriteria[page_size]'
var IMAGE_BASE_URL = "http://d3u6s2iyc5cpge.cloudfront.net/catalog/product/"
exports.convert_product_data = function (limit, offset, callback) {
  var URL = BASE_URL + encodeURIComponent(query_string) + '=' + limit
  console.log(URL)
  request(URL, function (err, response, body) {
    if (!err) {
      var data = JSON.parse(body)
      convert_helper(data.items, function (converted_data) {
        callback(null, converted_data)
      })
    }
    else {
      callback(err, null)
    }
  })
}
var convert_helper = function (data, callback) {
  var converted_data = []
  for (var i in data) {
    data_frame = data[i]
    for (j in data_frame.custom_attributes){
      var attributes = data_frame.custom_attributes[j]
      if (attributes.attribute_code === "short_description"){
        var description = attributes.value
      }
      if (attributes.attribute_code === "image"){
        var big_image = attributes.value
      }
      if (attributes.attribute_code === "small_image"){
        var small_image = attributes.value
      }
    }
    var json_object = {
      'id': data_frame.id,
      'remote_id': '',
      'url': '',
      'name': data_frame.name,
      'price': data_frame.price,
      'price_formatted': "$"+ data_frame.price,
      'category': "",
      'discount_price': data_frame.price,
      'discount_price_formatted': "$"+ data_frame.price,
      'currency': 'USD',
      'code': '',
      'description': description,
      'main_image': IMAGE_BASE_URL + small_image,
      'main_image_high_res': IMAGE_BASE_URL + big_image,
      'images': [],
      'variants': []
    }
    converted_data.push(json_object)
  }
  var converted_data_formatted = {
    'metadata':{
      'links': {},
      'sorting': "",
      'records_count': ""
    },
    'records': converted_data
  }
  callback(converted_data_formatted)
}