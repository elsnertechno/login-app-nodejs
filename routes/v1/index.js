const express = require("express");
const Router = express.Router();
const UserRoutes=require('./users')


Router.use("/user",UserRoutes)


module.exports = Router;
