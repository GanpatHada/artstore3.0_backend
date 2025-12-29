const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  receiverName: {
    type: String,
    required: true,
    default: '',
  },
  mobileNumber: {
    type: String,
    required: true,
    default: '',
  },
  pinCode: {
    required: true,
    type: String,
    default: '',
  },
  address1: {
    required: true,
    type: String,
    default: '',
  },
  address2: {
    required: true,
    type: String,
    default: '',
  },
  landmark: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    required: true,
    default: '',
  },
  state: {
    type: String,
    required: true,
    default: '',
  },
  country: {
    type: String,
    required: true,
    default: '',
  },
});
const Address = mongoose.model('Address', addressSchema);
module.exports = { addressSchema, Address };
