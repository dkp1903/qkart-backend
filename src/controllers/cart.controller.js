// CRIO_SOLUTION_START_MODULE_CART
// CRIO_SOLUTION_END_MODULE_CART
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { cartService } = require("../services");

/**
 * Fetch the cart details
 *
 * Example response:
 * HTTP 200 OK
 * {
 *  "_id": "5f82eebd2b11f6979231653f",
 *  "email": "crio-user@gmail.com",
 *  "cartItems": [
 *      {
 *          "_id": "5f8feede75b0cc037b1bce9d",
 *          "product": {
 *              "_id": "5f71c1ca04c69a5874e9fd45",
 *              "name": "ball",
 *              "category": "Sports",
 *              "rating": 5,
 *              "cost": 20,
 *              "image": "google.com",
 *              "__v": 0
 *          },
 *          "quantity": 2
 *      }
 *  ],
 *  "paymentOption": "PAYMENT_OPTION_DEFAULT",
 *  "__v": 33
 * }
 * 
// CRIO_SOLUTION_START_MODULE_CART
 * @param {User} req.user
// CRIO_SOLUTION_END_MODULE_CART
 *
 */
const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCartByUser(req.user);
  res.send(cart);
});

/**
 * Add a product to cart
 *
// CRIO_SOLUTION_START_MODULE_CART
 * @param {string} req.body.productId
 * @param {string} req.body.quantity
 * @param {User} req.user
// CRIO_SOLUTION_END_MODULE_CART
 *
 */
const addProductToCart = catchAsync(async (req, res) => {
  const cart = await cartService.addProductToCart(
    req.user,
    req.body.productId,
    req.body.quantity
  );

  res.status(httpStatus.CREATED).send(cart);
});

// TODO: CRIO_TASK_MODULE_CART - Implement updateProductInCart()
/**
 * Update product quantity in cart
 * - If updated quantity > 0, 
 * --- update product quantity in user's cart
 * --- return "200 OK" and the updated user object
 * - If updated quantity == 0, 
 * --- delete the product from user's cart
 * --- return "204 NO CONTENT"
 * 
 * Example responses:
 * HTTP 200 - on successful update
 * HTTP 204 - on successful product deletion
 * 
// CRIO_SOLUTION_START_MODULE_CART
 * @param {string} req.body.productId
 * @param {string} req.body.quantity
 * @param {User} req.user
// CRIO_SOLUTION_END_MODULE_CART
 *
 */
const updateProductInCart = catchAsync(async (req, res) => {
  // CRIO_SOLUTION_START_MODULE_CART
  // If quantity is set to zero, delete product entry from cart
  if (req.body.quantity == 0) {
    await cartService.deleteProductFromCart(req.user, req.body.productId);
    return res.status(httpStatus.NO_CONTENT).send();
  }

  const cart = await cartService.updateProductInCart(
    req.user,
    req.body.productId,
    req.body.quantity
  );

  return res.status(httpStatus.OK).send(cart);
  // CRIO_SOLUTION_END_MODULE_CART
});

/**
 * Checkout user's cart
 */
const checkout = catchAsync(async (req, res) => {
  // CRIO_UNCOMMENT_START_MODULE_TEST
  // await cartService.checkout();
  // CRIO_UNCOMMENT_END_MODULE_TEST
  // CRIO_SOLUTION_START_MODULE_TEST
  await cartService.checkout(req.user);
  // CRIO_SOLUTION_END_MODULE_TEST
  return (
    res
      // CRIO_SOLUTION_START_MODULE_TEST
      .status(httpStatus.NO_CONTENT)
      // CRIO_SOLUTION_END_MODULE_TEST
      .send()
  );
});

module.exports = {
  getCart,
  addProductToCart,
  updateProductInCart,
  checkout,
};
