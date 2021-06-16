// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
const request = require("supertest");
const httpStatus = require("http-status");
const app = require("../../src/app");
const setupTestDB = require("../utils/setupTestDB");
const { User } = require("../../src/models");
const { userOne, userTwo, insertUsers } = require("../fixtures/user.fixture");
const { userOneAccessToken } = require("../fixtures/token.fixture");

setupTestDB();

describe("User routes", () => {
  describe("GET user data", () => {
    describe("GET specific user", () => {
      test("should return 200 and the user object if data is ok", async () => {
        await insertUsers([userOne]);

        const res = await request(app)
          .get(`/v1/users/${userOne._id}`)
          .set("Authorization", `Bearer ${userOneAccessToken}`)
          .send();

        expect(res.status).toEqual(httpStatus.OK);

        expect(res.body).toEqual(
          expect.objectContaining({
            _id: userOne._id.toString(),
            email: userOne.email,
            name: userOne.name,
            walletMoney: userOne.walletMoney,
          })
        );
      });

      test("should return 400 if userId isn't a valid MongoID", async () => {
        await insertUsers([userOne]);
        const res = await request(app)
          .get(`/v1/users/invalidMongoID`)
          .set("Authorization", `Bearer ${userOneAccessToken}`)
          .send();

        expect(res.status).toEqual(httpStatus.BAD_REQUEST);
      });

      test("should return 401 error if access token is missing", async () => {
        await insertUsers([userOne]);

        const res = await request(app).get(`/v1/users/${userOne._id}`).send();

        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });

      test("should return 403 error if user is trying to get another user", async () => {
        await insertUsers([userOne, userTwo]);

        const res = await request(app)
          .get(`/v1/users/${userTwo._id}`)
          .set("Authorization", `Bearer ${userOneAccessToken}`)
          .send();

        expect(res.status).toEqual(httpStatus.FORBIDDEN);
      });
    });

    describe("Get Shipping address", () => {
      it("should return 200 and the adresss if data is ok", async () => {
        await insertUsers([userOne]);

        const res = await request(app)
          .get(`/v1/users/${userOne._id}?q=address`)
          .set("Authorization", `Bearer ${userOneAccessToken}`)
          .send();

        expect(res.status).toEqual(httpStatus.OK);
        expect(res.body).toEqual({
          address: userOne.address,
        });
      });

      it("should return 401 error if access token is missing", async () => {
        await insertUsers([userOne]);

        const res = await request(app)
          .get(`/v1/users/${userOne._id}?q=address`)
          .send();

        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });

      test("should return 403 error if user is trying to get another user", async () => {
        await insertUsers([userOne, userTwo]);

        const res = await request(app)
          .get(`/v1/users/${userTwo._id}?q=address`)
          .set("Authorization", `Bearer ${userOneAccessToken}`)
          .send();
        expect(res.status).toEqual(httpStatus.FORBIDDEN);
      });
    });

    describe("Set shipping address", () => {
      it("should return 200 if data is ok", async () => {
        await insertUsers([userOne]);

        const addressToSet =
          "This is my long random address hopefully satisfying the minimum length criteria";

        const res = await request(app)
          .put(`/v1/users/${userOne._id}`)
          .set("Authorization", `Bearer ${userOneAccessToken}`)
          .send({
            address: addressToSet,
          });

        expect(res.status).toEqual(httpStatus.OK);
        expect(res.body.address).toEqual(addressToSet);

        const dbUser = await User.findOne({ email: userOne.email });
        expect(dbUser.address).toEqual(addressToSet);
      });

      it("should return 400 error if address field isn't send in request body", async () => {
        await insertUsers([userOne]);

        const res = await request(app)
          .put(`/v1/users/${userOne._id}`)
          .set("Authorization", `Bearer ${userOneAccessToken}`)
          .send({});

        expect(res.status).toEqual(httpStatus.BAD_REQUEST);
      });

      it("should return 400 error if address field isn't at least 20 characters long", async () => {
        await insertUsers([userOne]);

        const res = await request(app)
          .put(`/v1/users/${userOne._id}`)
          .set("Authorization", `Bearer ${userOneAccessToken}`)
          .send({
            address: "small address",
          });

        expect(res.status).toEqual(httpStatus.BAD_REQUEST);
      });

      it("should return 401 error if access token is missing", async () => {
        await insertUsers([userOne]);
        const res = await request(app).put(`/v1/users/${userOne._id}`).send();

        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });
});
