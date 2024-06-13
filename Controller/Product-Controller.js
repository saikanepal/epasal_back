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
    const { name, description, category, price, variant, inventory, storeId } = req.body;
    try {
      const newProduct = new Product({
        name,
        description,
        category,
        price,
        variant,
        inventory,
        image: variant[0].options[0].image
      });
      await newProduct.save();
  
      const store = await Store.findById(storeId);
      if (store) {
        store.products.push(newProduct._id);
        await store.save();
      } else {
        return res.status(404).json({ success: false, message: "Store not found" });
      }
  
      return res.status(200).json({ success: true, message: "Product Added Successfully" });
    } catch (err) {
      console.error(err);
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
      console.error(err);
      return res.status(400).json({ success: false, message: "Error in updating product" });
    }
  };
  
  const DeleteProduct = async (req, res) => {
    const { id, storeId } = req.body;
    try {
      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      if (product.image && product.image.imageId) {
        await cloudinary.uploader.destroy(product.image.imageId);
      }
      const store = await Store.findById(storeId);
      for(items in product.variant){
        for(item in items.options){
          if(item.image.imageId!=null){
            await cloudinary.uploader.destroy(item.image.imageId);
          }
        }
      }
      
      if (store) {
        store.products = store.products.filter(productId => productId.toString() !== id);
        await store.save();
      } else {
        return res.status(404).json({ success: false, message: "Store not found" });
      }
      console.log(product)
      await Review.deleteMany({_id:{$in:product.review}})    //testing for review remaining
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Product deleted Successfully" });
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
      console.error(err);
      return res.status(400).json({ success: false, message: "Error in getting product" });
    }
    return res.json("hello");
  };
  
  module.exports = {
    addProduct,
    updateProduct,
    DeleteProduct,
    getProductById,
    getAllProductData,
    getProductByName
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
