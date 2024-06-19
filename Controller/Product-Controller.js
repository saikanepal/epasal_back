const Product = require("../Model/Product-model");
const Review = require("../Model/Review-Model");
const Store = require("../Model/Store-model");
const cloudinary = require("cloudinary").v2;
          
cloudinary.config({ 
  cloud_name: 'djx7wx2lc', 
  api_key: '789618457761788', 
  api_secret: 'CLCstY3E168HJ8OWRh9YSmnhaho' 
});


const addProduct = async (req, res) => {
    const { name, description, image,category, price, variant, inventory, storeId ,subcategories} = req.body.formState;
    console.log(req.body,"req body")
    try {
      const newProduct = new Product({
        name,
        description,
        category,
        subcategories,
        price,
        variant,
        inventory,
        image
      });
      await newProduct.save();
  
      const store = await Store.findById(req.body.storeID);
      if (store) {
        store.products.push(newProduct._id);
        await store.save();
      } else {
        return res.status(404).json({ success: false, message: "Store not found" });
      }
  
      return res.status(200).json({ success: true, message: "Product Added Successfully" });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ success: false, message: "Error in adding product" });
    }
  };
  
  const updateProduct = async (req, res) => {
    const { id, updates } = req.body;
    try {
      const productOld = await Product.findById(id);
      
      if (!productOld) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      if (productOld.image && productOld.image.imageId) {
        await cloudinary.uploader.destroy(productOld.image.imageId);
      }
      // const store = await Store.findById(storeId);
      for(items in productOld.variant){
        for(item in items.options){
          if(item.image.imageId!=null){
            await cloudinary.uploader.destroy(item.image.imageId);
          }
        }
      }
      const product = await Product.findByIdAndUpdate(id, updates, { new: true });
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      return res.status(200).json({ success: true, message: "Product updated successfully", product });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ success: false, message: "Error in updating product" });
    }
  };
  
  const DeleteProduct = async (req, res) => {
    const { id,storeId } = req.body;
    try {
      console.log(req.body,"aindoa")
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
  
      // Delete main product image if exists
      if (product.image && product.image.imageID) {
        await cloudinary.uploader.destroy(product.image.imageID);
      }
  
      // Delete variant images if they exist
      if (product.variant && product.variant[0] && product.variant[0].options) {
        const deletePromises = product.variant[0].options.map(async (item) => {
          if (item.image && item.image.imageID) {
            return cloudinary.uploader.destroy(item.image.imageID);
          }
        });
  
        await Promise.all(deletePromises);
      }
  
      // Find the store and remove the product reference
      const store = await Store.findById(storeId);
      if (store) {
        store.products = store.products.filter(productId => productId.toString() !== id);
        await store.save();
      } else {
        return res.status(404).json({ success: false, message: "Store not found" });
      }
  
      // Delete related reviews
      await Review.deleteMany({ _id: { $in: product.review } });
  
      // Finally, delete the product
      await Product.findByIdAndDelete(id);
  
      return res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ success: false, message: "Error in deleting product" });
    }
  };
  
  
  const getAllProductData = async (req, res) => {
    const { storeId } = req.params;
    try {
      const store = await Store.findById(storeId).populate('products');
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found" });
      }
      return res.status(200).json({ success: true, products: store.products });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ success: false, message: "Error in getting products" });
    }
    return res.json("hello")
  };


  const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      return res.status(200).json({ success: true, product });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ success: false, message: "Error in getting product" });
    }
    return res.json("hello");
  };

  const getProductByName = async (req, res) => {
    const { name } = req.body;
    try {
      const product = await Product.find({ name: { $regex: new RegExp(name, 'i') } });
      if (product.length===0) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      return res.status(200).json({ success: true, product });
    } catch (err) {
      console.log(error);
      return res.status(400).json({ success: false, message: "Error in getting product" });
    }
    return res.json("hello");
  };
  
  const getAllStoreProductByPagination = async (req, res) => {
    const { storeId } = req.params;
    const { page = 1, limit = 10, search = '', sortOrder = 'asc', productId, minPrice, maxPrice } = req.query;
  
    try {
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
  
      const matchCriteria = {
        $and: [
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ],
          },
          { _id: { $in: store.products } }
        ]
      };
  
      if (productId) {
        matchCriteria.$and.push({ _id: productId });
      }
  
      if (minPrice && maxPrice) {
        matchCriteria.$and.push({ price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) } });
      } else if (minPrice) {
        matchCriteria.$and.push({ price: { $gte: parseFloat(minPrice) } });
      } else if (maxPrice) {
        matchCriteria.$and.push({ price: { $lte: parseFloat(maxPrice) } });
      }
  
      const products = await Product.aggregate([
        { $match: matchCriteria },
        { $sort: { revenueGenerated: sortOrder === 'asc' ? 1 : -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
      ]);
  
      const totalProducts = await Product.countDocuments(matchCriteria);
      const totalPages = Math.ceil(totalProducts / limit);
  
      res.status(200).json({
        products,
        totalProducts,
        totalPages,
        currentPage: parseInt(page),
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error fetching store products', error });
    }
  };
  
  
  
  
  module.exports = {
    addProduct,
    updateProduct,
    DeleteProduct,
    getProductById,
    getAllProductData,
    getProductByName,
    getAllStoreProductByPagination
  };

// const addProduct=(req,res)=>{
//    const {name,description,category,price,variant,inventory}=req.body;
//    try{
//     const newProduct=new Product({
//         name,description,category,price,variant,inventory,image:variant[0].options[0].image
//     })
//     newProduct.save();
    
//    }catch(err){
//     return res.status(400).json({success:false,message:"error in adding product"})
//    }
//    return res.status(200).json({success:true,message:"Product Added Successfully"})
   

// }

// const DeleteProduct=async(req,res)=>{
//     const {id}=req.body;
//     try{
//         const findProduct=Product.findById(id)
//         const imageDelete=await cloudinary.uploader.destroy(findProduct.image.imageID);
//         for (item in findProduct.variant.)
//         const deletedProduct=Product.findByIdAndDelete(id)

//     }catch(err){
//         return res.status(400).json({success:false,message:"error in deleting product"})
//     }
//     return res.status(200).json({success:true,message:"Product deleted Successfully"})
// }
