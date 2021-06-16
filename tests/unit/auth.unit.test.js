// CRIO_SOLUTION_START_MODULE_AUTH
// CRIO_SOLUTION_END_MODULE_AUTH
const { userOne } = require("../fixtures/user.fixture");
const { authService, userService } = require("../../src/services");
const ApiError = require("../../src/utils/ApiError");
const mockingoose = require("mockingoose").default;

describe("Auth test", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe("Login", () => {
    it("should return user object if all ok", async () => {
      // return true when the isPasswordMatch() method is called on the userOne object
      userOne.isPasswordMatch = () => {
        return true;
      };

      // Setup mock function for the getUserByEmail() function of userService
      const getUserByEmailMock = jest.fn();

      // Return userOne object if getUserEmail() function of userService is called
      userService.getUserByEmail = getUserByEmailMock.mockReturnValue(userOne);

      let authResponse = await authService.loginUserWithEmailAndPassword(
        userOne.email,
        "password1"
      );

      // Check if the getUserByEmail() function was called
      expect(getUserByEmailMock).toHaveBeenCalled();
      // Check response
      expect(JSON.stringify(authResponse)).toEqual(JSON.stringify(userOne));
    });

    it("should return API error when password mismatch", async () => {
      userOne.isPasswordMatch = () => {
        return false;
      };

      userService.getUserByEmail = jest.fn().mockReturnValue(userOne);

      expect(
        authService.loginUserWithEmailAndPassword(userOne.email, "password1")
      ).rejects.toThrow(ApiError);
    });

    it("should return API error when user doesnt exist", async () => {
      userOne.isPasswordMatch = () => {
        return true;
      };

      userService.getUserByEmail = jest.fn().mockReturnValue(null);

      expect(
        authService.loginUserWithEmailAndPassword(userOne.email, "password1")
      ).rejects.toThrow(ApiError);
    });
  });
});
