var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload')
var db = require('./config/connection')
var session = require('express-session')
var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');

// connecting to database
db.connect((err) => {
  if (err) {
    console.log("connection error " + err);
  } else {
    console.log('DB Connected');
  }
})

var app = express();
var hbs = require('express-handlebars')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials'
}))

var handlebarHelpers = hbs.create({});

// register new function
handlebarHelpers.handlebars.registerHelper('increasePrice', function (price) {
  price += 10;
  return price;
})



// handlebarHelpers.handlebars.registerHelper('times', function (n, productId) {
//   var accum = '<div class="each_image">';
//   productId = parseInt(productId)
//   for (var i = 0; i < n; ++i) {
//    // let id = productId+i+1
//    // accum += '<img src="' + '/productImages/' + parseInt(productId+i+1) + '.jpg' + '" id="multiple-img"  class="multiple-image" >'
//    if(i === 0) {
//     accum += '<img src="'+ '/productImages/' + productId + '.jpg' + '" id="multiple-img"  class="multiple-image xzoom-gallery" >'
//    } else {
//     accum += '<img src = "' + '/productImages/product' + productId + i + '.jpg' + '" id="multiple-img"  class="multiple-image xzoom-gallery" >'
//    }

//   }
//   return accum+'</div>';
// });

handlebarHelpers.handlebars.registerHelper('showImages', function (n, productId) {
  var images;
  //productId = parseInt(productId)

  for (i = 1; i < n; i++) {
    // if(i === 0) {
    //   images += '<a href="' + '/productImages/' + productId + '.jpg">' + '<img class="xzoom-gallery" src="' + '/productImages/' + productId + '.jpg"></a>'
    // } else {
    //     images += '<a href="'+ '/productImages/' + productId + i + '.jpg">' + '<img class="xzoom-gallery" src="' + '/productImages/product' + productId + i + '.jpg"></a>' 
    // }
    //images += '<a href="'+ '/productImages/' + productId + i + '.jpg">' + '<img class="xzoom-gallery" src="' + '/productImages/product' + productId + i + '.jpg"></a>' 

    images += `
    <a href="/productImages/productImages/${productId}${i}.jpg">
      <img class="xzoom-gallery" src="/productImages/product${productId}${i}.jpg">
    </a>
    `
  }
  return images;
})


// session for user login
app.use(session(({ secret: "key", cookie: { maxAge: 60000000000 } })))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
