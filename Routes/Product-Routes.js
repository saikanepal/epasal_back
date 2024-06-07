const express = require('express');
const { addProduct,DeleteProduct,getAllProductData } = require('../Controller/Product-Controller');
const router = express.Router();
const productController=require('../Controller/Product-Controller')
router.get('/getAllStoreProduct/:storeId',productController.getAllProductData)

router.post('/addProduct',addProduct)
router.post('/deleteProduct',DeleteProduct)
router.post("/getProductByName",productController.getProductByName)


module.exports = router;