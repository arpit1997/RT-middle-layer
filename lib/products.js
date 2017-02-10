var request = require('request')
var BASE_URL = 'http://voicebee.tk/index.php/rest/default/V1/products?'
var BASE_URL_1 = 'http://d3u6s2iyc5cpge.cloudfront.net/products_dev.xml'
var parseString = require('xml2js').parseString;
var query_string = 'searchCriteria[page_size]'
var IMAGE_BASE_URL = "http://d3u6s2iyc5cpge.cloudfront.net/catalog/product/"
exports.convert_product_data = function (limit, offset, callback) {
  var URL = BASE_URL_1
  console.log(URL)
  request(URL, function (err, response, body) {
    if (!err) {
      parseString(body, function (err, result) {
        var data = result.response
        convert_helper(data.items[0].item, function (converted_data) {
          callback(null, converted_data)
        })
      });

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
    for (j in data_frame.custom_attributes[0].item){
      var attributes = data_frame.custom_attributes[0].item[j]
      if (attributes.attribute_code[0] === "short_description"){
        var description = attributes.value
      }
      if (attributes.attribute_code[0] === "image"){
        var big_image = attributes.value
      }
      if (attributes.attribute_code[0] === "small_image"){
        var small_image = attributes.value
      }
    }
    var price = ""
    try {
      price = data_frame.price[0]
    }
    catch (err){
      console.log(err)
      price = ""
    }


    var json_object = {
      'id': data_frame.id[0],
      'remote_id': '',
      'url': '',
      'name': data_frame.name[0],
      'price': price,
      'price_formatted': "$"+ price,
      'category': "1",
      'discount_price': price,
      'discount_price_formatted': "$"+ price,
      'currency': 'USD',
      'code': '',
      'description': description[0],
      'main_image': IMAGE_BASE_URL + small_image,
      'main_image_high_res': IMAGE_BASE_URL + big_image,
      'images': [],
      'variants': []
    }
    converted_data.push(json_object)
  }
  var converted_data_formatted = {
    'metadata':{
      'links': {
        "first": "https://secret-oasis-82354.herokuapp.com/v1.2/21/products?limit=10&offset=8",
        "last": "https://secret-oasis-82354.herokuapp.com/v1.2/21/products?limit=10&offset=8",
        "prev": "",
        "next": "https://secret-oasis-82354.herokuapp.com/v1.2/21/products?limit=10&offset=8",
        "self": "https://secret-oasis-82354.herokuapp.com/v1.2/21/products?limit=10&offset=8"
      },
      'sorting': "",
      'records_count': ""
    },
    'records': converted_data
  }
  callback(converted_data_formatted)
}