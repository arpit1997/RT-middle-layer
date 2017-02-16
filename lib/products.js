var request = require('request')
var BASE_URL = 'http://voicebee.tk/index.php/rest/default/V1/products?'
var BASE_URL_1 = 'http://d3u6s2iyc5cpge.cloudfront.net/xmls/dev/products.xml'
var BASE_URL_product = "http://localhost:3000/v1.2/21/products?limit=10&offset="
var parseString = require('xml2js').parseString;
var query_string = 'searchCriteria[page_size]'
var IMAGE_BASE_URL = 'http://d3u6s2iyc5cpge.cloudfront.net/catalog/product'
exports.convert_product_data = function (limit, offset, callback) {
  limit = parseInt(limit)
  offset = parseInt(offset)
  var URL = BASE_URL_1
  console.log(URL)
  request(URL, function (err, response, body) {
    if (!err) {
      parseString(body, function (err, result) {
        var data = result.response
        convert_helper(data.items[0].item, function (converted_data) {
          limit_data(converted_data, limit, offset, function (data) {
            callback(null, data)
          })

        })
      });

    }
    else {
      callback(err, null)
    }
  })
}

var limit_data = function (data, limit, offset, callback) {
  var records = []
  console.log(limit, offset)
  for (var i = offset-8 ; i< offset; i++) {
    if (i === limit + offset) {
      break
    }
    else {
      if (data.records[i] === undefined){
        data.metadata.links.next = null
        break
      }
      data.metadata.links.next = BASE_URL_product + (offset + 8)
      records.push(data.records[i])
    }
    data.metadata.links.self = BASE_URL_product + offset
    data.records_count = data.records.length
    data.metadata.records_count = data.records.length
  }
  data.records = records
  callback(data)
}

exports.fetch_single_product = function (product_id, callback) {
  var URL = BASE_URL_1
  var productId = parseInt(product_id)
  request(URL, function (err, response, body) {
    if (!err) {
      parseString(body, function (err, result) {
        var data = result.response
        convert_helper(data.items[0].item, function (converted_data) {
          for (var i in converted_data.records){
            var item = converted_data.records[i]
            if (item.id === productId){
              callback(null, item)
              break
            }
          }
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
      if (attributes.attribute_code[0] === 'short_description' || attributes.attribute_code[0] === 'description'){
        var description = attributes.value
      }
      if (attributes.attribute_code[0] === 'image'){
        var big_image = attributes.value
      }
      if (attributes.attribute_code[0] === 'small_image'){
        var small_image = attributes.value
      }
    }
    var imgs = []
    for (var j in data_frame.media[0].item){
      if (data_frame.media[0].item[j].media_type[0] === 'image')
        imgs.push(IMAGE_BASE_URL + data_frame.media[0].item[j].file[0]);
    }
    var price = ''
    try {
      price = parseInt(data_frame.price[0])
    }
    catch (err){
      price = 0
    }
    var json_object = {
      'id': parseInt(data_frame.id[0]),
      'remote_id': 34,
      'url': 'http://google.com',
      'name': data_frame.name[0],
      'price': price,
      'price_formatted': '$'+ price,
      'category': 1,
      'discount_price': parseInt(price),
      'discount_price_formatted': '$'+ price,
      'currency': 'USD',
      'code': 'fd',
      'description': description[0],
      'main_image': IMAGE_BASE_URL + small_image,
      'main_image_high_res': IMAGE_BASE_URL + big_image,
      'images': imgs,
      'variants': [
        {
          'id':0,
          'color':{
            'id':0,
            'remote_id':0,
            'value':'blue',
            'code':'',
            'img': null
          },
          'size':{
            'id':0,
            'remote_id': 0,
            'value': 'something'
          },
          'images': imgs,
          'code':'abcd'
        }
      ]
    }
    converted_data.push(json_object)
  }
  var converted_data_formatted = {
    'metadata':{
      'links': {
        'first': BASE_URL_product + 8,
        'last': '',
        'prev': null,
        'next': '',
        'self': ''
      },
      'sorting': 'newest',
      'records_count': 0
    },
    'records': converted_data
  }
  callback(converted_data_formatted)
}