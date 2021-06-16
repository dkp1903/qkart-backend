// CRIO_SOLUTION_START_MODULE_AUTH
// CRIO_SOLUTION_END_MODULE_AUTH
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { productService } = require("../services");

/**
 * Get product by productId
 *
 * Example responses:
 * HTTP 200
 * {
 *      "_id": "5f71c1ca04c69a5874e9fd45",
 *      "name": "ball",
 *      "category": "Sports",
 *      "rating": 5,
 *      "cost": 20,
 *      "image": "google.com",
 *      "__v": 0
 * }
 *
 *
 */
const getProductById = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  res.send(product);
});

/**
 * Get list of all products (Not authenticated route)
 *
 * Example responses:
 * HTTP 200
 *
 * [
 *  {
 *      "_id": "5f71c1ca04c69a5874e9fd45",
 *      "name": "ball",
 *      "category": "Sports",
 *      "rating": 5,
 *      "cost": 20,
 *      "image": "google.com",
 *      "__v": 0
 *  },
 *  {
 *      "_id": "5f71c1ca04c69a5874e9fd46",
 *      "name": "bat",
 *      "category": "Sports",
 *      "rating": 3,
 *      "cost": 20,
 *      "image": "google.com",
 *      "__v": 0
 *  }
 *]
 *
 */
const getProducts = catchAsync(async (req, res) => {
  const products = await productService.getProducts();
  res.send(products);
});

module.exports = {
  getProductById,
  getProducts,
};
