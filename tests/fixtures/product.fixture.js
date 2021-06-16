// CRIO_SOLUTION_START_MODULE_AUTH
// CRIO_SOLUTION_END_MODULE_AUTH
const mongoose = require("mongoose");
const { Product } = require("../../src/models");

const productOne = {
  _id: mongoose.Types.ObjectId(),
  name: "bat",
  category: "Sports",
  rating: 3,
  cost: 20,
  image: "google.com",
};

const productTwo = {
  _id: mongoose.Types.ObjectId(),
  name: "ball",
  category: "Sports",
  rating: 3,
  cost: 5,
  image: "google.com",
};

const insertProducts = async (products) => {
  await Product.insertMany(products);
};

module.exports = {
  productOne,
  productTwo,
  insertProducts,
};
