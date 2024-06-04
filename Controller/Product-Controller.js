const Product = require("../Model/Product-model");
const cloudinary = require("cloudinary").v2;
          
cloudinary.config({ 
  cloud_name: 'djx7wx2lc', 
  api_key: '789618457761788', 
  api_secret: 'CLCstY3E168HJ8OWRh9YSmnhaho' 
});
const addProduct=(req,res)=>{
   const {name,description,category,price,variant,inventory}=req.body;
   try{
    const newProduct=new Product({
        name,description,category,price,variant,inventory,image:variant[0].options[0].image
    })
    newProduct.save();
    
   }catch(err){
    return res.status(400).json({success:false,message:"error in adding product"})
   }
   return res.status(200).json({success:true,message:"Product Added Successfully"})
   

}

const DeleteProduct=async(req,res)=>{
    const {id}=req.body;
    try{
        
        const imageDelete=await cloudinary.uploader.destroy("cld-sample-5");

    }catch(err){
        return res.status(400).json({success:false,message:"error in deleting product"})
    }
    return res.status(200).json({success:true,message:"Product deleted Successfully"})
}
module.exports={
    addProduct,
    DeleteProduct
}