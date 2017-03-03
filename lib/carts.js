var request = require('request')

var CART_ITEMS_URL = 'https://rentoys.xyz/index.php/rest/V1/carts/mine/items'
var CART_DETAILS = "https://rentoys.xyz/index.php/rest/V1/carts/mine/"

/**
 * This function retrieves items in cart of the given userusing acces token
 * @param {String} access_token
 * @param {function} callback callback function
 * @return {json} body returns cart items of the user in json format
 */
exports.cart_items = function (access_token, callback) {
    options = {
        url: CART_ITEMS_URL,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    }
    request(options, function (err, response, body) {
        if (!err){
            callback(body)
        }
    })
}

/**
 * This function creates a list of product sku's of the items in the cart
 * @param {json} data items in te cart of the user
 * @param {function} callback callback function
 * @return {list} returns a list of product sku's
 */
exports.retrieve_product_sku = function (data, callback) {
    var product_sku = []
    for (var i in data){
        var data_frame = data[i]
        product_sku.push(data_frame.sku)
    }
    callback(product_sku)
}

/**
 * This function creates the details of the cart and its items
 * @param {json} cart_details detsils of the cart
 * @param {json} cart_items product details of the items in the cart
 * @param {list} cart_items_mini A list of items in the cart
 * @param {function} callback callback function
 * @return {json} json_obj returns complete details of he cart and its items
 */
exports.cart_info_items = function (cart_details, cart_items, cart_items_mini, callback) {
    cart_details = JSON.parse(cart_details)
    var total_price = 0
    var total_items = 0
    for (var i in cart_items.records){
        var item = cart_items.records[i]
        item.quantity = cart_items_mini[i].qty
        item.total_item_price = item.price * item.quantity
        item.total_item_price_formatted = '$' + item.total_item_price
        total_price += item.total_item_price
        total_items += item.quantity
        item.variants[0].id = cart_items.records[i].id
        item.variants[0].product_id = cart_items.records[i].id
        item.variants[0].remote_id = cart_items.records[i].id
        item.variants[0].main_image = cart_items.records[i].main_image
        item.variants[0].url = cart_items.records[i].url
        item.variants[0].name = cart_items.records[i].name
        item.variants[0].price = cart_items.records[i].price
        item.variants[0].price_formatted = cart_items.records[i].price_formatted
        item.variants[0].category = cart_items.records[i].category
        item.variants[0].discount_price = cart_items.records[i].discount_price
        item.variants[0].discount_prie_formatted = cart_items.records[i].discount_price_formatted
        item.variants[0].currency = cart_items.records[i].currency
        item.variants[0].code = cart_items.records[i].code
        item.variants[0].description = cart_items.records[i].description
        item.variants[0].main_image = cart_items.records[i].main_image
        item.variant = item.variants[0]
        item.expiration = 123456
        item.is_reservation = false
    }
    var json_obj = {
        id: cart_details.id,
        product_count: total_items,
        total_price: total_price,
        total_price_formatted: '$' + total_price,
        currency: 'USD',
        items: cart_items.records,
        shipping: null,
        discounts: []

    }
    callback(json_obj)
}

/**
 * This function  retrieves cart details using access token of the user
 * @param {String} access_token access token of the user
 * @param {function} callback callback function
 * @return {json} body returns cart details in json format
 */
exports.cart_details = function (access_token, callback) {
    console.log(access_token)
    options = {
        url: CART_DETAILS,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    }
    request(options, function (err, response, body) {
        if(!err){
            callback(body)
        }
        else{
            callback({status: 500})
        }
    })
}
