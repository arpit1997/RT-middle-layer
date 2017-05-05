var request = require('request')
var urls = require('../config.js')
var parseString = require('xml2js').parseString;
var query_string = 'searchCriteria[page_size]'

/**
 * This function retrieves product data in xml format and converts into json format
 * @param {int} limit
 * @param {int} offset
 * @param {function} callback callback function
 * @return {json} returns converted data in json format
 */
exports.convert_product_data = function (limit, offset, callback) {
  limit = parseInt(limit)
  offset = parseInt(offset)
  var URL = urls.BASE_URL_1
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

/**
 * This function retrieves details of available categories in xml format and converts into json format
 * @param {int} category available category
 * @param {function} callback callback function
 * @return {json} results returns details of category data in json format
 */
exports.convert_category_data = function(category, callback){
  var URL = urls.BASE_URL_CATEGORY + category + ".xml"
  request(URL, function(err, response, body){
    if (!err){
      parseString(body, function(err, results){
        callback(results)
      })
    }
  })
}

/**
 * This function creates a list of sku's from the category data
 * @param {json} data category details
 * @param {function} callback callback function
 * @return {list} returns list of category sku's
 */
exports.retrieve_category_sku = function (data, callback) {
  var category_sku = []
  for (var i in data.response.item){
    var data_frame = data.response.item[i]
    category_sku.push(data_frame.sku[0])
  }
  callback(category_sku)
}

/**
 * This function matches the provided sku's from all the products and returns matched queries
 * @param {json} data product details of all available products
 * @param {list} category_sku list of sku's of categories
 * @param {function} callback callback function
 * @return {json} category_wise_products returns category wise products
 */
exports.get_category_wise_product = function (data, category_sku, callback) {
  var category_wise_records = []
  for (var j in category_sku){
    for (var i in data.records){
      var sku = data.records[i].sku
      if (category_sku[j] === sku){
        category_wise_records.push(data.records[i])
      }
    }
  }
  var category_wise_products = {
    'metadata':{
      'links': {
        'first': '',
        'last': '',
        'prev': null,
        'next': '',
        'self': ''
      },
      'sorting': 'newest',
      'records_count': 0
    },
    'records': category_wise_records
  }
  callback(category_wise_products)
}

/**
 * This function uses limit and offset params to return paginated data for category
 * @param {json} data product details of available products in a category
 * @param {int} limit limit param
 * @param {int} offset offset param
 * @param {int} category category
 * @param {function} callback callback function
 * @return {json} returns paginated query results
 */
exports.limit_cat_data = function (data, limit, offset, category, callback) {
  var records = []
  for (var i = offset ; i< offset+limit; i++) {
    if (i === limit + offset) {
      break
    }
    else {
      if (data.records[i] === undefined){
        data.metadata.links.next = null
        break
      }
      data.metadata.links.next = urls.BASE_URL_category + limit + "&offset=" + (offset+limit) + "&category=" + category
      records.push(data.records[i])
    }

  }
  data.metadata.links.self = urls.BASE_URL_product + limit + "&offset=" + offset + "&category=" + category
  data.metadata.links.first = urls.BASE_URL_product + limit + "&offset=0" + "&category=" + category
  data.records_count = data.records.length
  data.metadata.records_count = data.records.length
  data.records = records
  callback(data)
}


/**
 * This function uses limit and offset params to return paginated data
 * @param {json} data product details of available products in a category
 * @param {int} limit limit param
 * @param {int} offset offset param
 * @param {function} callback callback function
 * @return {json} returns paginated query results
 */
exports.limit_data = function (data, limit, offset, callback) {
  var records = []
  for (var i = offset ; i< offset+limit; i++) {
    if (i === limit + offset) {
      break
    }
    else {
      if (data.records[i] === undefined){
        data.metadata.links.next = null
        break
      }
      data.metadata.links.next = urls.BASE_URL_product + limit + "&offset=" + (offset+limit)
      records.push(data.records[i])
    }
    data.metadata.links.self = urls.BASE_URL_product + limit + "&offset=" + offset
    data.metadata.links.first = urls.BASE_URL_product + limit + "&offset=0"
    data.records_count = data.records.length
    data.metadata.records_count = data.records.length
  }
  data.records = records
  callback(data)
}

/**
 * This function fetches details of single product using product id
 * @param {int} product_id product id
 * @param {function} callback callback function
 * @return {json, json} returns error and details of the item
 */
exports.fetch_single_product = function (product_id, callback) {
  var URL = urls.BASE_URL_1
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

/**
 * Helper function to convert reformat the data and its attr
 * @param {json} data product details
 * @param {function} callback callback function
 * @return {json} converted_data_formatted returns reformatted data of products
 */
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
      if (attributes.attribute_code[0] === 'cost'){
        var cost = attributes.value
      }
    }
    var imgs = []
    for (var j in data_frame.media[0].item){
      if (data_frame.media[0].item[j].media_type[0] === 'image')
        imgs.push(urls.IMAGE_BASE_URL + data_frame.media[0].item[j].file[0]);
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
      'sku': data_frame.sku[0],
      'price': parseInt(cost),
      'cost': parseInt(price),
      'mrp': parseInt(price),
      'price_formatted': 'Rs ' + parseInt(cost),
      'category': 1,
      'discount_price': parseInt(price),
      'discount_price_formatted': 'Rs ' + price,
      'currency': 'Rupees',
      'code': 'fd',
      'description': description[0],
      'main_image': urls.IMAGE_BASE_URL + small_image,
      'main_image_high_res': urls.IMAGE_BASE_URL + big_image,
      'images': imgs,
      'variants': [
        {
          'id':parseInt(data_frame.id[0]),
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
        'first': '',
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