var express = require('express')
var request = require('request')
var url = require('url')
var excel = require('excel4node')
var parseString = require('xml2js').parseString
var products = require('../lib/products')
var router = express.Router()

/* GET home page. */
router.get('/:shop_id/products', function (req, res, next) {
  var url_parts = url.parse(req.url, true)
  var limit = url_parts.query.limit
  var offset = url_parts.query.offset
  var category = url_parts.query.category
  if (limit === undefined && offset === undefined) {
    limit = 8
    offset = 0
  }
  limit = parseInt(limit)
  offset = parseInt(offset)
  if (category !== undefined) {
    next()
  }
  else {
    category = parseInt(category)
    products.convert_product_data(limit, offset, function (err, converted_data) {
      if (err) {
        res.json({'status': '500'})
      }
      else {
        products.limit_data(converted_data, limit, offset, function (data) {
          res.json(data)
        })
      }
    })
  }

})

router.get('/:shop_id/products', function (req, res, next) {
  var url_parts = url.parse(req.url, true)
  var limit = url_parts.query.limit
  var offset = url_parts.query.offset
  var category = url_parts.query.category
  var sorting = url_parts.query.sort
  var records = []
  if (limit === undefined && offset === undefined) {
    limit = 8
    offset = 0
  }
  if (limit === undefined){
    limit = 8
  }
  limit = parseInt(limit)
  offset = parseInt(offset)
  products.convert_category_data(category, function (results) {
    products.retrieve_category_sku(results, function (category_sku) {
      products.convert_product_data(limit, offset, function (err, converted_data) {
        if (!err){
          products.get_category_wise_product(converted_data, category_sku, function (data) {
            products.limit_cat_data(data, limit, offset, category, function (cat_wise_data) {
              if (sorting === "price_ASC"){
                records = cat_wise_data.records
                records.sort(function (a,b) {
                  return parseFloat(a.price) > parseFloat(b.price)
                })
                cat_wise_data.records = records
                res.json(cat_wise_data)
              }
              else{
                if (sorting === "price_DESC"){
                  records = cat_wise_data.records
                  records.sort(function (a,b) {
                    return parseFloat(a.price) < parseFloat(b.price)
                  })
                  cat_wise_data.records = records
                  res.json(cat_wise_data)
                }
                else {
                  res.json(cat_wise_data)
                }
              }

            })
          })
        }
      })
    })
  })

})

router.get('/:shop_id/products/:product_id', function (req, res, next) {
  products.fetch_single_product(req.params.product_id, function (err, data) {
    if (err) {
      res.json({'status': '500'})
    }
    else {
      res.json(data)
    }
  })
})

router.get('/hello', function (req, res) {
    var wb = new excel.Workbook();

// Add Worksheets to the workbook
    var ws = wb.addWorksheet('Sheet 1');

    ws.cell(1, 1).string('id');
    ws.cell(1, 2).string('title');
    ws.cell(1, 3).string('descrition');
    ws.cell(1, 4).string('link');
    ws.cell(1, 5).string('image_link');
    ws.cell(1, 6).string('availability');
    ws.cell(1, 7).string('price');
    ws.cell(1, 8).string('condition');
    ws.cell(1, 9).string('adult');
    ws.cell(1, 10).string('gender');

    var limit = 0;
    var offset = 0;
    products.convert_product_data(limit, offset, function (err, converted_data) {
        if (err) {
            res.json({'status': '500'})
        }
        else {

        }
    })
})



// Set value of cell A1 to 100 as a number type styled with paramaters of style


// wb.write('Excel.xlsx');
// res.send()
// });

router.get('/:shop_id/wishlist/is-in-wishlist/:product_id', function (req, res, next) {
  var json_obj = {
	"is_in_wishlist": false,
	"wishlist_product_id": null
  }
  res.json(json_obj)
})
module.exports = router