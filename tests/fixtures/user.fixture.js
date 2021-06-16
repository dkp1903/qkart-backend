// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const faker = require("faker");
const { User } = require("../../src/models");

const password = "password1";
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  _id: mongoose.Types.ObjectId(),
  walletMoney: 200,
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  address:
    "This is my long random address hopefully satisfying the minimum length criteria",
};

const userTwo = {
  _id: mongoose.Types.ObjectId(),
  walletMoney: 200,
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  address: "ADDRESS_NOT_SET",
};

const insertUsers = async (users) => {
  await User.insertMany(
    users.map((user) => ({ ...user, password: hashedPassword }))
  );
};

module.exports = {
  userOne,
  userTwo,
  insertUsers,
};
