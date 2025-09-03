const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asynchandler");

const addAddress = asyncHandler(async (req, res) => {
  const user = req.user;

  const newAddress = Object.assign({}, req.body, {
    landmark: req.body.landmark || ""
  });

  user.addresses.push(newAddress);
  await user.save();

  const recentAddressObj = user.addresses.at(-1);

  return res.status(201).json(
    new ApiResponse(
      201,
      recentAddressObj,
      "Address added successfully"
    )
  );
});


const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  if (!addressId) {
    throw new ApiError(400, "Address ID not provided", "MISSING_ADDRESS_ID");
  }

  const user = req.user;

  const initialLength = user.addresses.length;

  user.addresses = user.addresses.filter(
    (address) => address._id.toString() !== addressId
  );

  if (user.addresses.length === initialLength) {
    throw new ApiError(404, "Address not found", "ADDRESS_NOT_FOUND");
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      addressId,
      "Address deleted successfully"
    )
  );
});

const makePrimaryAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  if (!addressId) {
    throw new ApiError(400, "Address ID not provided", "MISSING_ADDRESS_ID");
  }

  const user = req.user;

  const primaryAddress = user.addresses.find(
    (address) => address._id.toString() === addressId
  );

  if (!primaryAddress) {
    throw new ApiError(404, "Address not found", "ADDRESS_NOT_FOUND");
  }

  const otherAddresses = user.addresses.filter(
    (address) => address._id.toString() !== addressId
  );
  user.addresses = [primaryAddress, ...otherAddresses];

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      addressId,
      "Address has been marked as primary"
    )
  );
});

const editAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = req.user;

  if (!addressId) {
    throw new ApiError(400, "Address ID not provided", "ADDRESS_ID_MISSING");
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found", "ADDRESS_NOT_FOUND");
  }

  Object.assign(address, {
    ...req.body,
    landmark: req.body.landmark || "",
  });

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, address, "Address updated successfully")
  );
});


module.exports = { addAddress,deleteAddress,makePrimaryAddress,editAddress}