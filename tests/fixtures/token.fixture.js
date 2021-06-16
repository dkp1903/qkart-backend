// CRIO_SOLUTION_START_MODULE_AUTH
// CRIO_SOLUTION_END_MODULE_AUTH
const config = require("../../src/config/config");
const { tokenTypes } = require("../../src/config/tokens");
const tokenService = require("../../src/services/token.service");
const { userOne, userTwo } = require("./user.fixture");

const accessTokenExpires =
  Math.floor(Date.now() / 1000) + config.jwt.accessExpirationMinutes * 60;

const userOneAccessToken = tokenService.generateToken(
  userOne._id,
  accessTokenExpires,
  tokenTypes.ACCESS
);

const userTwoAccessToken = tokenService.generateToken(
  userTwo._id,
  accessTokenExpires,
  tokenTypes.ACCESS
);

module.exports = {
  userOneAccessToken,
  userTwoAccessToken,
};
