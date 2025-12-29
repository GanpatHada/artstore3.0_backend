const Store = require('../models/store');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asynchandler');
const uploadOnCloudinary = require('../utils/cloudinary');

// ================= Create Store ======================

const createStore = asyncHandler(async (req, res) => {
  const existingStore = await Store.findOne({ seller: req.seller._id });
  if (existingStore) {
    throw new ApiError(400, 'Store already created', 'DUPLICATE_STORE');
  }

  const {
    street,
    city,
    state,
    postalCode,
    country,
    accountHolderName,
    accountNumber,
    ifscCode,
    gstin,
    ...rest
  } = req.body;

  const storePayload = {
    ...rest,
    seller: req.seller._id,
    address: {
      street,
      city,
      state,
      postalCode,
      country: country ?? 'India',
    },
    bankDetails: {
      accountHolderName,
      accountNumber,
      ifscCode,
    },
    gstin: gstin ?? null,
    businessLogo: null,
  };

  const store = await Store.create(storePayload);

  if (req.file?.path) {
    const businessLogoUrl = await uploadOnCloudinary(
      req.file.path,
      `artstore/store/${store._id}`,
      'businessLogo',
    );
    if (!businessLogoUrl)
      throw new ApiError(500, 'Image upload failed', 'IMAGE_UPLOAD_FAILED');
    store.businessLogo = businessLogoUrl;
    await store.save();
  }

  return res
    .status(201)
    .json(new ApiResponse(201, store, 'Store created successfully'));
});

const updateStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ seller: req.seller._id });
  if (!store) throw new ApiError(404, 'Store not found', 'STORE_NOT_FOUND');

  const {
    street,
    city,
    state,
    postalCode,
    country,
    accountHolderName,
    accountNumber,
    ifscCode,
    gstin,
    ...rest
  } = req.body;

  Object.assign(store, rest);
  store.gstin = gstin ?? null;
  store.address = {
    street: street ?? store.address.street,
    city: city ?? store.address.city,
    state: state ?? store.address.state,
    postalCode: postalCode ?? store.address.postalCode,
    country: country ?? store.address.country,
  };

  store.bankDetails = {
    accountHolderName: accountHolderName ?? store.bankDetails.accountHolderName,
    accountNumber: accountNumber ?? store.bankDetails.accountNumber,
    ifscCode: ifscCode ?? store.bankDetails.ifscCode,
  };

  if (req.file?.path) {
    const businessLogoUrl = await uploadOnCloudinary(
      req.file.path,
      `artstore/store/${store._id}`,
      'businessLogo',
    );
    if (!businessLogoUrl)
      throw new ApiError(500, 'Image upload failed', 'IMAGE_UPLOAD_FAILED');
    store.businessLogo = businessLogoUrl;
  } else if (!('businessLogo' in req.body)) {
    store.businessLogo = null;
  }

  await store.save();

  return res
    .status(200)
    .json(new ApiResponse(200, store, 'Store updated successfully'));
});

// ================= Get Store ======================

const getStoreDetails = asyncHandler(async (req, res) => {
  const existingStore = await Store.findOne({ seller: req.seller._id })
    .select('-__v')
    .lean();

  if (!existingStore) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Store has not been created yet'));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, existingStore, 'Store details fetched successfully'),
    );
});

module.exports = { createStore, getStoreDetails, updateStore };
