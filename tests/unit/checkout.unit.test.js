// CRIO_SOLUTION_START_MODULE_TEST
// CRIO_SOLUTION_END_MODULE_TEST
const httpStatus = require("http-status");
const { userOne, userTwo } = require("../fixtures/user.fixture");
const { Cart } = require("../../src/models");
const { cartService } = require("../../src/services");
const {
  cartWithProductsUserOne,
  emptyCart,
  cartWithProductsUserTwo,
} = require("../fixtures/cart.fixture");
const ApiError = require("../../src/utils/ApiError");
const mockingoose = require("mockingoose").default;
const config = require("../config/config");

// Tests related to the Cart layer
describe("Cart test", () => {
  // Reset any mocked objects after each individual test
  beforeEach(() => {
    mockingoose.resetAll();
  });

  // Tests for checking checkout functionality
  describe("Checkout", () => {
    // Test a particular scenario of the checkout functionality
    it("should throw 404 error if cart is not present", async () => {
      // Mock Cart model to return `null` as output to `Cart.findOne()` call
      mockingoose(Cart).toReturn(null, "findOne");

      const res = cartService.checkout(userOne);

      // TODO: CRIO_TASK_MODULE_TEST - Assert if
      /* - ApiError is thrown
       * - the "statusCode" field of response is "404 NOT FOUND"
       *
       * Example ApiError output
       * {
       *  "statusCode": 404,
       *  "message": "User does not have a cart",
       *  "stack": "<Error-stack-trace-if-present>"
       * }
       */
      // CRIO_UNCOMMENT_START_MODULE_TEST
      // expect(true).toEqual(false);
      // CRIO_UNCOMMENT_END_MODULE_TEST
      // CRIO_SOLUTION_START_MODULE_TEST
      await expect(res).rejects.toThrow(ApiError);
      await expect(res).rejects.toEqual(
        expect.objectContaining({
          statusCode: httpStatus.NOT_FOUND,
        })
      );
      // CRIO_SOLUTION_END_MODULE_TEST
    });

    it("should throw 400 error if user's cart doesn't have any product", async () => {
      // Mock Cart model to return `emptyCart` object as output to `Cart.findOne()` call
      mockingoose(Cart).toReturn(emptyCart, "findOne");

      const res = cartService.checkout(userOne);

      // TODO: CRIO_TASK_MODULE_TEST - Assert if
      // - ApiError is thrown
      // - the "statusCode" field of response is "400 BAD REQUEST"
      // CRIO_SOLUTION_START_MODULE_TEST
      await expect(res).rejects.toThrow(ApiError);
      await expect(res).rejects.toEqual(
        expect.objectContaining({
          statusCode: httpStatus.BAD_REQUEST,
        })
      );
      // CRIO_SOLUTION_END_MODULE_TEST
    });

    it("should throw 400 error if address is not set", async () => {
      expect(userTwo.address).toEqual(config.default_address);

      mockingoose(Cart).toReturn(cartWithProductsUserTwo, "findOne");

      // create a mock function for User model's hasSetNonDefaultAddress() instance method
      const hasSetNonDefaultAddressMock = jest.fn();
      userTwo.hasSetNonDefaultAddress = hasSetNonDefaultAddressMock.mockReturnValue(
        false
      );

      const res = cartService.checkout(userTwo);

      // TODO: CRIO_TASK_MODULE_TEST - Assert if
      // - ApiError is thrown
      // - the "statusCode" field of response is "400 BAD REQUEST"
      // CRIO_SOLUTION_START_MODULE_TEST
      await expect(res).rejects.toThrow(ApiError);
      await expect(res).rejects.toEqual(
        expect.objectContaining({
          statusCode: httpStatus.BAD_REQUEST,
        })
      );
      // CRIO_SOLUTION_END_MODULE_TEST
    });

    it("should throw 400 error if wallet balance is insufficient", async () => {
      mockingoose(Cart).toReturn(cartWithProductsUserOne, "findOne");

      const userOneWithZeroBalance = { ...userOne, walletMoney: 0 };

      // create a mock function for User model's hasSetNonDefaultAddress() instance method
      const hasSetNonDefaultAddressMock = jest.fn();
      userOneWithZeroBalance.hasSetNonDefaultAddress = hasSetNonDefaultAddressMock.mockReturnValue(
        true
      );

      const res = cartService.checkout(userOneWithZeroBalance);

      // TODO: CRIO_TASK_MODULE_TEST - Assert if
      // - ApiError is thrown
      // - the "statusCode" field of response is "400 BAD REQUEST"
      // CRIO_SOLUTION_START_MODULE_TEST
      await expect(res).rejects.toThrow(ApiError);
      await expect(res).rejects.toEqual(
        expect.objectContaining({
          statusCode: httpStatus.BAD_REQUEST,
        })
      );
      // CRIO_SOLUTION_END_MODULE_TEST
    });

    it("should update user balance and empty the cart on success", async () => {
      let userOneFinal = { ...userOne };

      // Mock the save() method on userOneFinal as it's not an instance of User object
      userOneFinal.save = jest.fn();

      // create a mock function for User model's hasSetNonDefaultAddress() instance method
      const hasSetNonDefaultAddressMock = jest.fn();
      userOneFinal.hasSetNonDefaultAddress = hasSetNonDefaultAddressMock.mockReturnValue(
        true
      );

      // define a mock object for `cart.save()` call - assert saved Cart object
      let cartSaveMock = (...args) => {
        // Check if the cart was emptied on calling save()
        expect(args[0].cartItems.length).toEqual(0);
        return args[0];
      };

      // Return `cartSaveMock` object on calling `save()` function of Cart model
      mockingoose(Cart).toReturn(cartSaveMock, "save");
      mockingoose(Cart).toReturn(cartWithProductsUserOne, "findOne");

      // Call the method to be tested - `checkout()`
      await cartService.checkout(userOneFinal);

      // Assert User model's hasSetNonDefaultAddress() instance method was called
      expect(hasSetNonDefaultAddressMock.mock.calls.length).not.toBe(0);

      // TODO: CRIO_TASK_MODULE_TEST - Assert that the wallet balance of user was reduced
      // CRIO_UNCOMMENT_START_MODULE_TEST
      // expect(true).toEqual(false);
      // CRIO_UNCOMMENT_END_MODULE_TEST
      // CRIO_SOLUTION_START_MODULE_TEST
      expect(userOneFinal.walletMoney).toBeLessThan(userOne.walletMoney);
      // CRIO_SOLUTION_END_MODULE_TEST
    });
  });
});
