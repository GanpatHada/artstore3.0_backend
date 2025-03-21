const Product = require("../models/product");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asynchandler");
const uploadOnCloudinary = require("../utils/cloudinary");

const addProduct = asyncHandler(async (req, res) => {
  const { title, description, heightInCm, widthInCm, category, price,discount} = req.body;

  //check for missing and empty fields

  if (
    [title, description, category, heightInCm, widthInCm, price].some(
      (field) => field === undefined || field.trim().length === 0
    )
  ) {
    throw new ApiError(400, "required fields are missing or empty");
  }

  //check for imagesPath

  const productImages = req.files;
  if (productImages.length === 0) {
    throw new ApiError(400, "product Images are required");
  }
  const productImagesPath=req.files.map(file=>file.path);
  let productImagesUrls=[];
  if(productImagesPath)
  {
    for(const productImagePath of productImagesPath)
    {
      const productImageUrl=await uploadOnCloudinary(productImagePath);
      productImagesUrls.push(productImageUrl)

    }
  }
  //save Product
  const newProduct = await Product.create({
    title,
    description,
    dimensions: {
      height: heightInCm,
      width: widthInCm,
    },
    productImages:productImagesUrls,
    category,
    price,
    actualPrice:price,
    artist: req._id,
    discount:discount || 0
  });
  if (!newProduct) {
    throw new ApiError(500, "Something went wrong while adding Product");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, newProduct, "Product added successfully!"));
});

const getProducts=asyncHandler(async(_,res)=>{
  const products=await Product.find();
  if(products)
    return res.status(201).json(new ApiResponse(201,products,'Products fetched successfully'));
  else
    throw new ApiError(401,"Something went wrong while fetching products");
})


const getProductDetails=asyncHandler(async(req,res)=>{
  const {productId}=req.params;
  try {
    const product=await Product.findById(productId).populate({
			path: 'artist',
      select:'_id fullName reviews',
			populate: {
				path: 'reviews',
				populate: {
					path: 'user',
          select:'fullName'
				},
			},
		});
    if(!product)
      throw new ApiError(400,"Product not found")
    return res.status(201).json(new ApiResponse(201,product,'Product Details fetched successfully'));
  } catch (error) {
    throw new ApiError(401,"Something went wrong while fetching product details");
  }
    
})




module.exports = { addProduct,getProducts,getProductDetails};
