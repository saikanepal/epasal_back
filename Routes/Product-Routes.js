const express = require('express');
const { addProduct,DeleteProduct } = require('../Controller/Product-Controller');
const router = express.Router();

router.post('/addProduct',addProduct)
router.post('/deleteProduct',DeleteProduct)

module.exports = router;