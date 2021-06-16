// CRIO_SOLUTION_START_MODULE_AUTH
// CRIO_SOLUTION_END_MODULE_AUTH
const request = require("supertest");
const httpStatus = require("http-status");
const app = require("../../src/app");
const setupTestDB = require("../utils/setupTestDB");
const {
  productOne,
  productTwo,
  insertProducts,
} = require("../fixtures/product.fixture");

setupTestDB();

describe("Product routes", () => {
  describe("GET /v1/products", () => {
    test("should return 200 and response object should be ok", async () => {
      await insertProducts([productOne, productTwo]);

      const res = await request(app).get("/v1/products").send();

      expect(res.status).toEqual(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toEqual(
        expect.objectContaining({
          _id: productOne._id.toHexString(),
          name: productOne.name,
          category: productOne.category,
          cost: productOne.cost,
          rating: productOne.rating,
          image: productOne.image,
        })
      );
    });
  });

  describe("GET /v1/products/:productId", () => {
    test("should return 200 and the product object if data is ok", async () => {
      await insertProducts([productOne]);

      const res = await request(app)
        .get(`/v1/products/${productOne._id}`)
        .send();

      expect(res.status).toEqual(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          _id: productOne._id.toHexString(),
          name: productOne.name,
          category: productOne.category,
          cost: productOne.cost,
          rating: productOne.rating,
          image: productOne.image,
        })
      );
    });

    test("should return 401 when invalid Mongo Id is given", async () => {
      await insertProducts([productOne]);

      const res = await request(app).get(`/v1/products/100000`).send();

      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    test("should return 404 when the product is not found", async () => {
      await insertProducts([productOne]);

      const res = await request(app)
        .get(`/v1/products/${productTwo._id}`)
        .send();

      expect(res.status).toEqual(httpStatus.NOT_FOUND);
    });
  });
});
