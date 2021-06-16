// CRIO_SOLUTION_START_MODULE_CART
// CRIO_SOLUTION_END_MODULE_CART
const mongoose = require("mongoose");
const { userOne, userTwo } = require("./user.fixture");
const { Cart } = require("../../src/models");
const config = require("../../src/config/config");

const emptyCart = {
  _id: mongoose.Types.ObjectId(),
  email: userOne.email,
  cartItems: [],
  paymentOption: config.default_payment_option,
  __v: 32,
};

const cartWithProductsUserOne = {
  _id: mongoose.Types.ObjectId(),
  email: userOne.email,
  cartItems: [
    {
      _id: "5f8feede75b0cc037b1bce9d",
      product: {
        _id: "5f71c1ca04c69a5874e9fd45",
        name: "ball",
        category: "Sports",
        rating: 5,
        cost: 20,
        image: "google.com",
        __v: 0,
      },
      quantity: 2,
    },
  ],
  paymentOption: "PAYMENT_OPTION_WALLET",
  __v: 33,
};

const cartWithProductsUserTwo = {
  _id: mongoose.Types.ObjectId(),
  email: userTwo.email,
  cartItems: [
    {
      _id: "5f8feede75b0cc037b1bce9d",
      product: {
        _id: "5f71c1ca04c69a5874e9fd45",
        name: "ball",
        category: "Sports",
        rating: 5,
        cost: 20,
        image: "google.com",
        __v: 0,
      },
      quantity: 2,
    },
  ],
  paymentOption: "PAYMENT_OPTION_WALLET",
  __v: 33,
};

const insertCart = async (carts) => {
  await Cart.insertMany(carts);
};

module.exports = {
  emptyCart,
  cartWithProductsUserOne,
  cartWithProductsUserTwo,
  insertCart,
};
