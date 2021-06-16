// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
const express = require("express");
const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const productRoute = require("./product.route");
const cartRoute = require("./cart.route");

const router = express.Router();

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Reroute all API requests beginning with the `/v1/users` route to Express router in user.route.js
// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
router.use("/users", userRoute);
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS

// CRIO_SOLUTION_START_MODULE_AUTH
router.use("/auth", authRoute);
// CRIO_SOLUTION_END_MODULE_AUTH
// TODO: CRIO_TASK_MODULE_AUTH - Reroute all API requests beginning with the `/v1/auth` route to Express router in auth.route.js 
router.use("/products", productRoute);
router.use("/cart", cartRoute);

module.exports = router;
