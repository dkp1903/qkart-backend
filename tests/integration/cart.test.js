// CRIO_SOLUTION_START_MODULE_CART
// CRIO_SOLUTION_END_MODULE_CART
const request = require("supertest");
const faker = require("faker");
const httpStatus = require("http-status");
const app = require("../../src/app");
const setupTestDB = require("../utils/setupTestDB");
const { Cart, User } = require("../../src/models");
const { userOne, userTwo, insertUsers } = require("../fixtures/user.fixture");
const {
  productOne,
  productTwo,
  insertProducts,
} = require("../fixtures/product.fixture");
const {
  cartWithProductsUserOne,
  cartWithProductsUserTwo,
  emptyCart,
  insertCart,
} = require("../fixtures/cart.fixture");
const {
  userOneAccessToken,
  userTwoAccessToken,
} = require("../fixtures/token.fixture");

setupTestDB();

describe("Cart routes", () => {
  describe("Get user's cart", () => {
    it("should return 200 and the object for empty cart if data is ok", async () => {
      // Insert dummy user and cart directly to test db
      await insertUsers([userOne]);
      await insertCart([emptyCart]);

      // Simulate API request using a wrapper
      const res = await request(app)
        .get(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send();

      // Check response status code
      expect(res.status).toEqual(httpStatus.OK);

      // Check response body
      expect(res.body).toEqual(
        expect.objectContaining({
          email: userOne.email,
          cartItems: emptyCart.cartItems,
          paymentOption: emptyCart.paymentOption,
        })
      );
    });

    it("should return 200 and the object for non-empty cart if data is ok", async () => {
      await insertUsers([userOne]);
      await insertCart([cartWithProductsUserOne]);

      const res = await request(app)
        .get(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send();

      expect(res.status).toEqual(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          email: userOne.email,
          cartItems: cartWithProductsUserOne.cartItems,
          paymentOption: cartWithProductsUserOne.paymentOption,
        })
      );
    });

    it("should return 401 error if access token is missing", async () => {
      const res = await request(app).get(`/v1/cart/`).send();

      expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should return 404 if cart doesn't exist for user", async () => {
      await insertUsers([userOne]);
      const res = await request(app)
        .get(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send();

      expect(res.status).toEqual(httpStatus.NOT_FOUND);
    });
  });

  describe("Add new item to cart", () => {
    it("should return 201 if data is ok", async () => {
      // Add dummy user, products and cart to test DB
      await insertUsers([userOne]);
      await insertProducts([productOne, productTwo]);
      await insertCart([emptyCart]);

      // Simulate the API request using a wrapper
      const res = await request(app)
        .post(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
          quantity: 5,
        });

      // Validate the response status code
      expect(res.status).toEqual(httpStatus.CREATED);

      // Validate response body
      expect(res.body.email).toEqual(userOne.email);
      expect(res.body.cartItems[0].product._id).toEqual(
        productOne._id.toString()
      );
      expect(res.body.cartItems[0].quantity).toEqual(5);

      // Get user's updated Cart item from test db
      const dbCart = await Cart.findOne({ email: userOne.email });
      const addedProduct = dbCart.cartItems.filter(
        (cartItem) =>
          cartItem.product._id.toString() == productOne._id.toString()
      );

      // Validate on user's cart stored in test db
      expect(dbCart).toBeDefined();
      expect(addedProduct[0].product.name).toEqual(productOne.name);
      expect(addedProduct[0].product.category).toEqual(productOne.category);
    });

    it("should return 201 and create new cart for user if not already existing", async () => {
      await insertUsers([userOne]);
      await insertProducts([productOne, productTwo]);

      let dbCart = await Cart.findOne({ email: userOne.email });
      expect(dbCart).toBeNull();

      const res = await request(app)
        .post(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
          quantity: 5,
        });

      expect(res.status).toEqual(httpStatus.CREATED);

      dbCart = await Cart.findOne({ email: userOne.email });

      expect(dbCart).not.toBeNull();
    });

    it("should return 400 error if productId is missing", async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          quantity: 5,
        });

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should return 400 error if quantity is missing", async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
        });

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should return 400 error if product already in cart", async () => {
      await insertUsers([userOne]);
      await insertProducts([productOne]);

      await request(app)
        .post(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
          quantity: 5,
        })
        .expect(httpStatus.CREATED);

      const res = await request(app)
        .post(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
          quantity: 2,
        });

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should return 400 error if product not in products list", async () => {
      await insertUsers([userOne]);
      await insertProducts([productOne]);

      const res = await request(app)
        .post(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productTwo._id,
          quantity: 5,
        });

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should return 401 error if access token is missing", async () => {
      await insertUsers([userOne]);

      const res = await request(app).post(`/v1/cart`).send({
        productId: productOne._id,
        quantity: 5,
      });

      expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });

  describe("Update cart items", () => {
    it("should return 200 and the cart data if success", async () => {
      await insertUsers([userOne]);
      await insertProducts([productOne, productTwo]);
      await insertCart([emptyCart]);

      const initialQuantity = 2;
      await request(app)
        .post(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
          quantity: initialQuantity,
        })
        .expect(httpStatus.CREATED);

      const newQuantity = 5;
      const res = await request(app)
        .put(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
          quantity: newQuantity,
        });

      expect(res.status).toEqual(httpStatus.OK);

      expect(res.body.email).toEqual(userOne.email);

      const productOneInCart = res.body.cartItems.filter(
        (cartItem) => cartItem.product._id === productOne._id.toString()
      );
      // Check duplicate entries are not added for a product when updated
      expect(productOneInCart.length).toEqual(1);
      // Check for updated quantity
      expect(productOneInCart[0].quantity).toEqual(newQuantity);

      const dbCart = await Cart.findOne({ email: userOne.email });
      expect(dbCart).toBeDefined();

      const productOneInCartDB = dbCart.cartItems.filter(
        (cartItem) =>
          cartItem.product._id.toString() === productOne._id.toString()
      );
      expect(productOneInCartDB.length).toEqual(1);
      expect(productOneInCartDB[0].quantity).toEqual(5);
    });

    it("should delete product entry when quantity is set to 0", async () => {
      await insertUsers([userOne]);
      await insertProducts([productOne, productTwo]);
      await insertCart([emptyCart]);

      await request(app)
        .post(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
          quantity: 5,
        });

      const res = await request(app)
        .put(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
          quantity: 0,
        });

      expect(res.status).toEqual(httpStatus.NO_CONTENT);

      const dbCart = await Cart.findOne({ email: userOne.email });
      expect(dbCart).toBeDefined();

      const productOneInCartDB = dbCart.cartItems.filter(
        (cartItem) => cartItem.product._id === productOne._id.toString()
      );
      expect(productOneInCartDB.length).toEqual(0);
    });

    it("should return 400 error if productId is missing", async () => {
      await insertUsers([userOne]);

      const newQuantity = 5;
      const res = await request(app)
        .put(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          quantity: newQuantity,
        });

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should return 400 error if quantity is missing", async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .put(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
        });

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should return 400 error if product not in cart", async () => {
      await insertUsers([userOne]);
      await insertProducts([productOne]);
      await insertCart([emptyCart]);

      const res = await request(app)
        .put(`/v1/cart`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send({
          productId: productOne._id,
          quantity: 5,
        });

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should return 401 error if access token is missing", async () => {
      await insertUsers([userOne]);

      const res = await request(app).post(`/v1/cart`).send({
        productId: productOne._id,
        quantity: 5,
      });
      expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });
});
