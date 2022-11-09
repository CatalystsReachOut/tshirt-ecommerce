import bigPromise from "../middlewares/bigPromise.js";
import cloudinary from "cloudinary";
import Product from "../models/Product.js";
import  dotenv  from "dotenv"
dotenv.config();
import { WhereClause } from "../utils/whereClause.js";
// cloudinary.config({ 
//     cloud_name: 'doha4fkyu', 
//     api_key: '781879781462834', 
//     api_secret: 'Fkm9AE7852K5Y-DeyJcgmeKwnLs' 
//   });

cloudinary.config({ 
    cloud_name:process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

// export const testProduct = bigPromise(async(req,res,next)=>{
//     console.log(req.query)
//     return res.status(200).json({
//         "success":true,
//         "message":"test product"
//     })
// })

export const addProduct = bigPromise(async(req,res,next)=>{
    // images
    let imageArray = []
    console.log(req.files[0].path)
    // console.log(req)

    // check image files
    if(!req.files){
        return res.status(400).json({
            success:false,
            message:"Images are required !"
        })
    }

    
    //upload images
    if(req.files){
        for (let index = 0; index < req.files.length; index++) {
            
            let result = await cloudinary.v2.uploader.upload(req.files[index].path ,{
                folder:"products"
            })

            console.log(req.files[index])

            imageArray.push({
                id:result.public_id,
                secure_url:result.secure_url
            })
        }  
    }
    

    req.body.photos=imageArray;
    req.body.user=req.user.id

    const product = await Product.create(req.body);
    res.status(200).json({
        success:true,
        product
    })

})

export const getAllProduct = bigPromise(async(req,res,next)=>{

    // products to render
    const resultPerPage = 2;
    const totalCountProduct = await Product.countDocuments()
    
    const productsObjs = await  new WhereClause(Product.find(),req.query).search().filter();
    let products = await productsObjs.base;
    let filteredProductNumber = products.length;

    // pagination
    productsObjs.pager(resultPerPage);
    products = await productsObjs.base.clone();

    res.status(200).json({
        success:true,
        products,
        filteredProductNumber,
        totalCountProduct
    })

})

export const getOneProduct = bigPromise(async(req,res,next)=>{

    const product = await Product.findById(req.params.id)

    if(!product){
        return res.status(501).json({
            success:false,
            message:"No such product with this id exists!"
        })
    }

    res.status(200).json({
        success:true,
        message:"Product Found",
        product
    })

})

export const adminGetAllProduct = bigPromise(async(req,res,next)=>{
    const products = await Product.find();
    if(!products)
    {
        return res.status(501).json({
            success:false,
            message:"No products available!"
        })
    }

    res.status(200).json({
        success:true,
        products
    })
})

export const adminUpdateOneProduct = bigPromise(async(req,res,next)=>{
    
    const product = await Product.findById(req.params.id)

    console.log(product)
    if(!product){
        return res.status(501).json({
            success:false,
            message:"No product found with this id!"
        })
    }

    let imageArray = []

    if(req.files){
        // destroy the images
        for (let index = 0; index < product.photos.length; index++) {
            const res = await cloudinary.v2.uploader.destroy(product.photos[index].id)            
        }
        
        // upload new images and save
        for (let index = 0; index < req.files.length; index++) {
            let result = await cloudinary.v2.uploader.upload(req.files[index].path ,{
                folder:"products"
            })
            console.log(req.files[index])
            imageArray.push({
                id:result.public_id,
                secure_url:result.secure_url
            })
        } 

    }

    req.body.photos = imageArray;
    const newData = {
        name:req.body.name,
        price:req.body.price,
        description:req.body.description,
        photos:req.body.photos,
        category:req.body.category,
        brand:req.body.brand

    }

    const products = await Product.findByIdAndUpdate(req.params.id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(201).json({
        success:true,
        message:"Product updated sucessfully !!"
    })

    
})

export const adminDeleteOneProduct = bigPromise(async(req,res,next)=>{
    
    const product = await Product.findById(req.params.id)

    console.log(product)
    if(!product){
        return res.status(501).json({
            success:false,
            message:"No product found with this id!"
        })
    }
    for (let index = 0; index < product.photos.length; index++) {
        const res = await cloudinary.v2.uploader.destroy(product.photos[index].id)            
    }

    await product.remove();

    res.status(201).json({
        success:true,
        message:"Product deleted sucessfully !!"
    })

    
})

export const addReview = bigPromise(async(req,res,next)=>{
    const {rating, comment, productId} = req.body

    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }

    const product = await findById(req.params.id)
    
    const alreadyReview = product.reviews.find(
        (rev)=>rev.user.toString() === req.user._id.toString()
    )
    if(alreadyReview){
        
    }
    else{
        product.reviews.push(review)
        product.numberOfReviews=product.reviews.length
    }
})