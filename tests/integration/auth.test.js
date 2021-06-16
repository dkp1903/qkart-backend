// CRIO_SOLUTION_START_MODULE_AUTH
// CRIO_SOLUTION_END_MODULE_AUTH
const request = require("supertest");
const faker = require("faker");
const httpStatus = require("http-status");
const httpMocks = require("node-mocks-http");
const app = require("../../src/app");
const config = require("../../src/config/config");
const auth = require("../../src/middlewares/auth");
const { tokenService } = require("../../src/services");
const ApiError = require("../../src/utils/ApiError");
const setupTestDB = require("../utils/setupTestDB");
const { User } = require("../../src/models");
const { tokenTypes } = require("../../src/config/tokens");
const { userOne, insertUsers } = require("../fixtures/user.fixture");
const { userOneAccessToken } = require("../fixtures/token.fixture");

setupTestDB();

describe("Auth routes", () => {
  describe("POST /v1/auth/register", () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: "password1",
      };
    });

    test("should return 201 and successfully register user if request data is ok", async () => {
      const res = await request(app).post("/v1/auth/register").send(newUser);

      expect(res.status).toEqual(httpStatus.CREATED);

      expect(res.body.user).toEqual(
        expect.objectContaining({
          _id: expect.anything(),
          name: newUser.name,
          email: newUser.email,
          walletMoney: config.default_wallet_money,
        })
      );

      const dbUser = await User.findById(res.body.user._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        name: newUser.name,
        email: newUser.email,
      });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test("returned token is valid for user", async () => {
      const res = await request(app).post("/v1/auth/register").send(newUser);

      const req = httpMocks.createRequest({
        headers: { Authorization: `Bearer ${res.body.tokens.access.token}` },
      });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user.email).toEqual(newUser.email);
    });

    test("should return 400 error if email is invalid", async () => {
      newUser.email = "invalidEmail";

      const res = await request(app).post("/v1/auth/register").send(newUser);

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    test("should return 200 error if email is already used", async () => {
      // Ref - https://stackoverflow.com/a/53144807
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      const res = await request(app).post("/v1/auth/register").send(newUser);

      expect(res.status).toEqual(httpStatus.OK);
    });

    test("should return 400 error if password length is less than 8 characters", async () => {
      newUser.password = "passwo1";

      const res = await request(app).post("/v1/auth/register").send(newUser);

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if password does not contain both letters and numbers", async () => {
      newUser.password = "password";

      let res = await request(app).post("/v1/auth/register").send(newUser);

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);

      newUser.password = "11111111";

      res = await request(app).post("/v1/auth/register").send(newUser);

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if email field isn't present", async () => {
      // Create clone of newUser and delete email field
      let cloneUser = Object.assign({}, newUser);
      delete cloneUser.email;

      const res = await request(app).post("/v1/auth/register").send(cloneUser);

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if name field isn't present", async () => {
      // Create clone of newUser and delete name field
      let cloneUser = Object.assign({}, newUser);
      delete cloneUser.name;

      const res = await request(app).post("/v1/auth/register").send(cloneUser);

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if password field isn't present", async () => {
      // Create clone of newUser and delete password field
      let cloneUser = Object.assign({}, newUser);
      delete cloneUser.password;

      const res = await request(app).post("/v1/auth/register").send(cloneUser);

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });
  });

  describe("POST /v1/auth/login", () => {
    test("should return 200 and login user if email and password match", async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const res = await request(app)
        .post("/v1/auth/login")
        .send(loginCredentials);

      expect(res.status).toEqual(httpStatus.OK);

      expect(res.body.user).toEqual(
        expect.objectContaining({
          _id: expect.anything(),
          name: userOne.name,
          email: userOne.email,
          walletMoney: expect.any(Number),
        })
      );

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test("should return 401 error if there are no users with that email", async () => {
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const res = await request(app)
        .post("/v1/auth/login")
        .send(loginCredentials);

      expect(res.status).toEqual(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: expect.any(String),
      });
    });

    test("should return 401 error if password is wrong", async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: "wrongPassword1",
      };

      const res = await request(app)
        .post("/v1/auth/login")
        .send(loginCredentials);

      expect(res.status).toEqual(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: expect.any(String),
      });
    });

    test("should return 400 error if email field isn't present", async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        password: userOne.password,
      };

      const res = await request(app)
        .post("/v1/auth/login")
        .send(loginCredentials);

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if password field isn't present", async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
      };

      const res = await request(app)
        .post("/v1/auth/login")
        .send(loginCredentials);

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });
  });

  describe("Auth middleware", () => {
    test("should call next with no errors if access token is valid", async () => {
      await insertUsers([userOne]);
      const req = httpMocks.createRequest({
        headers: { Authorization: `Bearer ${userOneAccessToken}` },
      });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user._id).toEqual(userOne._id);
    });

    test("should call next with unauthorized error if access token is not found in header", async () => {
      await insertUsers([userOne]);
      const req = httpMocks.createRequest();
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: expect.any(String),
        })
      );
    });

    test("should call next with unauthorized error if access token is not a valid jwt token", async () => {
      await insertUsers([userOne]);
      const req = httpMocks.createRequest({
        headers: { Authorization: "Bearer randomToken" },
      });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: expect.any(String),
        })
      );
    });

    test("should call next with unauthorized error if the token is not an access token", async () => {
      await insertUsers([userOne]);

      const expires =
        Math.floor(Date.now() / 1000) + config.jwt.accessExpirationMinutes * 60;

      const refreshToken = tokenService.generateToken(
        userOne._id,
        expires,
        tokenTypes.REFRESH
      );
      const req = httpMocks.createRequest({
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: expect.any(String),
        })
      );
    });

    test("should call next with unauthorized error if access token is generated with an invalid secret", async () => {
      await insertUsers([userOne]);
      const expires =
        Math.floor(Date.now() / 1000) + config.jwt.accessExpirationMinutes * 60;

      const accessToken = tokenService.generateToken(
        userOne._id,
        expires,
        tokenTypes.ACCESS,
        "invalidSecret"
      );
      const req = httpMocks.createRequest({
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: expect.any(String),
        })
      );
    });

    test("should call next with unauthorized error if access token is expired", async () => {
      await insertUsers([userOne]);
      const expires = Math.floor(Date.now() / 1000) - 1 * 60;

      const accessToken = tokenService.generateToken(
        userOne._id,
        expires,
        tokenTypes.ACCESS
      );
      const req = httpMocks.createRequest({
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: expect.any(String),
        })
      );
    });

    test("should call next with unauthorized error if user is not found", async () => {
      const req = httpMocks.createRequest({
        headers: { Authorization: `Bearer ${userOneAccessToken}` },
      });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: expect.any(String),
        })
      );
    });
  });
});
