// CRIO_SOLUTION_START_MODULE_CART
// CRIO_SOLUTION_END_MODULE_CART
const mongoose = require('mongoose');
const { productSchema } = require('./product.model');
const config = require("../config/config")

// TODO: CRIO_TASK_MODULE_CART - Complete cartSchema, a Mongoose schema for "carts" collection
const cartSchema = mongoose.Schema(
  {
    // CRIO_SOLUTION_START_MODULE_CART
    email: {
      type: String,
      required: true,
      unique: true,
    },
    cartItems: [
      {
        product: productSchema,
        quantity: Number,
      },
    ],
    paymentOption: {
      type: String,
      default: config.default_payment_option,
    },
    // CRIO_SOLUTION_END_MODULE_CART
  },
  {
    timestamps: false,
  }
);


/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports.Cart = Cart;