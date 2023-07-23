var createError = require('http-errors');
var express = require('express')
var request =require('request')
var app = express()
require('dotenv').config()
const db = require('./config/dbconfig.js');
const elasticClient = require("./config/elasticSearch.js");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var userroutes1 = require('./routes/userRoutes.js');
var postRoutes1 = require('./routes/postRoutes.js');
const port = 5000
var cors = require('cors')
const expressSanitizer = require('express-sanitizer');
 // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })) 
// parse application/json
app.use(logger('dev'));
app.use(cors())
app.use(bodyParser.json())
app.use(expressSanitizer())
app.use(cookieParser());
app.use("/api/user",userroutes1);
app.use("/api/post",postRoutes1);
async function checkConnection() {
  try {
    const info = await elasticClient.info(); // Perform an operation to retrieve cluster information
    console.log("Connected to Elasticsearch:", info.body.cluster_name);
  } catch (error) {
    console.error("Error connecting to Elasticsearch:", error);
  }
}

checkConnection();
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})