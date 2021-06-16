// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement a route definition for `/v1/users/:userId`
// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
router.get(
  "/:userId",
  // CRIO_SOLUTION_START_MODULE_AUTH
  auth(),
  // CRIO_SOLUTION_END_MODULE_AUTH
  validate(userValidation.getUser),
  userController.getUser
);
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS

// Supports updating address only currently
router.put(
  "/:userId",
  auth(),
  validate(userValidation.setAddress),
  userController.setAddress
);

module.exports = router;
