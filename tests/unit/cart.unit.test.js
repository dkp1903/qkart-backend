// CRIO_SOLUTION_START_MODULE_CART
// CRIO_SOLUTION_END_MODULE_CART
const httpStatus = require("http-status");
const { userOne } = require("../fixtures/user.fixture");
const { Cart, Product } = require("../../src/models");
const { cartService } = require("../../src/services");
const {
  cartWithProductsUserOne,
  emptyCart,
} = require("../fixtures/cart.fixture");
const ApiError = require("../../src/utils/ApiError");
const mockingoose = require("mockingoose").default;
const { productOne } = require("../fixtures/product.fixture");

describe("Cart test", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe("GET cart", () => {
    it("should call findOne method", async () => {
      mockingoose(Cart).toReturn(emptyCart, "findOne");
      let res = await cartService.getCartByUser(userOne);

      expect(res.toJSON()).toEqual(emptyCart);
    });

    it("should throw error if user does not have a cart", async () => {
      mockingoose(Cart).toReturn(null, "findOne");
      expect(cartService.getCartByUser(userOne.email)).rejects.toThrow(
        ApiError
      );
    });
  });

  describe("Add product to cart", () => {
    it("should return cart on success", async () => {
      // Mock Cart.findOne() method to return predefined cart
      mockingoose(Cart).toReturn(emptyCart, "findOne");

      // Mock Product.findOne() method to return predefined product
      mockingoose(Product).toReturn(productOne, "findOne");

      // Mock Cart.save() function
      let saveMock = (...args) => {
        expect(args[0].cartItems.length).toEqual(1);
        expect(args[0].cartItems[0].product._id).toEqual(productOne._id);
        return args[0];
      };
      mockingoose(Cart).toReturn(saveMock, "save");

      const qty = 5;
      const res = await cartService.addProductToCart(
        userOne,
        productOne._id,
        qty
      );

      const addedProduct = res.cartItems.filter(
        (cartItem) =>
          cartItem.product._id.toString() == productOne._id.toString()
      );

      expect(res.email).toEqual(userOne.email);
      expect(addedProduct.length).toEqual(1);
      expect(addedProduct[0].quantity).toEqual(qty);
    });

    it("should throw 500 error if cart is empty", async () => {
      // Mock Product.findOne() method to return predefined product
      mockingoose(Product).toReturn(productOne, "findOne");

      // Mock Cart.findOne() method to return null
      mockingoose(Cart).toReturn(null, "findOne");

      // NOTE - Mocks the Cart.create() method globally from here
      Cart.create = jest.fn().mockReturnValueOnce(null);

      const qty = 5;
      const res = cartService.addProductToCart(userOne, productOne._id, qty);

      expect(res).rejects.toThrow(ApiError);
      expect(res).rejects.toEqual(
        expect.objectContaining({
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        })
      );
    });
  });

  describe("Update product in cart", () => {
    it("should save and return the updated cart", async () => {
      // Mock Cart.findOne() method to return predefined cart
      mockingoose(Cart).toReturn(cartWithProductsUserOne, "findOne");
      mockingoose(Product).toReturn(
        cartWithProductsUserOne.cartItems[0].product,
        "findOne"
      );
      // Mock Cart.save() function
      const updatedQty = 5;
      let saveMock = (...args) => {
        expect(args[0].cartItems.length).toEqual(1);
        expect(args[0].cartItems[0].quantity).toEqual(updatedQty);
        return args[0];
      };
      mockingoose(Cart).toReturn(saveMock, "save");

      const existingProduct = cartWithProductsUserOne.cartItems[0].product;

      const res = await cartService.updateProductInCart(
        userOne,
        existingProduct._id,
        updatedQty
      );

      const updatedProduct = res.cartItems.filter(
        (cartItem) => cartItem.product._id.toString() == existingProduct._id
      );

      expect(res.email).toEqual(userOne.email);
      expect(updatedProduct[0].quantity).toEqual(updatedQty);
    });

    it("should throw 400 error if cart is null", async () => {
      // Mock Cart.findOne() method to return predefined cart
      mockingoose(Cart).toReturn(null, "findOne");

      const qty = 5;
      const res = cartService.updateProductInCart(userOne, productOne._id, qty);

      expect(res).rejects.toThrow(ApiError);

      expect(res).rejects.toEqual(
        expect.objectContaining({
          statusCode: httpStatus.BAD_REQUEST,
        })
      );
    });

    it("should throw 400 error if product to update is not in cart", async () => {
      // Mock Cart.findOne() method to return predefined cart
      mockingoose(Cart).toReturn(emptyCart, "findOne");

      const qty = 5;
      const res = cartService.updateProductInCart(userOne, productOne._id, qty);

      expect(res).rejects.toThrow(ApiError);

      expect(res).rejects.toEqual(
        expect.objectContaining({
          statusCode: httpStatus.BAD_REQUEST,
        })
      );
    });
  });

  describe("delete product in cart", () => {
    it("should delete product from cart", async () => {
      let saveMock = (...args) => {
        expect(args[0].cartItems.length).toEqual(0);
        return args[0];
      };

      mockingoose(Cart).toReturn(cartWithProductsUserOne, "findOne");
      mockingoose(Cart).toReturn(saveMock, "save");

      const existingProduct = cartWithProductsUserOne.cartItems[0].product;
      await cartService.deleteProductFromCart(userOne, existingProduct._id);
    });

    it("should throw 400 error if cart is null", async () => {
      // Mock Cart.findOne() method to return predefined cart
      mockingoose(Cart).toReturn(null, "findOne");

      const res = cartService.deleteProductFromCart(userOne, productOne._id);

      expect(res).rejects.toThrow(ApiError);

      expect(res).rejects.toEqual(
        expect.objectContaining({
          statusCode: httpStatus.BAD_REQUEST,
        })
      );
    });

    it("should throw error if product to delete not in cart", async () => {
      // Mock Cart.findOne() method to return predefined cart
      mockingoose(Cart).toReturn(emptyCart, "findOne");

      const res = cartService.deleteProductFromCart(userOne, productOne._id);

      expect(res).rejects.toThrow(ApiError);

      expect(res).rejects.toEqual(
        expect.objectContaining({
          statusCode: httpStatus.BAD_REQUEST,
        })
      );
    });
  });
});
