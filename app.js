var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressMongoDb = require('express-mongo-db');
var cors = require('cors');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressMongoDb('mongodb://admin:password123@ds111623.mlab.com:11623/questions'));

app.use('/', indexRouter);
app.use('/api', apiRouter);

module.exports = app;
