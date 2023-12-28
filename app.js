require('./models'); // This should import your model
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, `./env/${envFile}`) });
const { initModels, connect } = require("./helpers/database");
const v1 = require("./routes/v1");
global.chalk = require('chalk');
global.moment = require('moment');
var app = express();
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

connect().then(() => {
  console.log(chalk.green("Database connect successfully!"))
}).catch((err) => {
  console.log(chalk.red("[ERROR]:Database connection"))
  console.log(chalk.red(err))
});
initModels();

//Start API endpoint:
app.use("/v1", v1);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
