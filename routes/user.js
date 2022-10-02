var express = require('express');
const { resolve } = require('promise');
const { response } = require('../app');
var router = express.Router();
var userHelper = require('../helpers/userHelper');


router.get('/', function (req, res, next) {
  let date = new Date().toDateString();
  let user = req.session.user;
  userHelper.getFoodsForYou().then((cakes) => {
    userHelper.getFurnituresForYou().then((furnitures) => {
      userHelper.getPaintingsForYou().then((paintings) => {
        userHelper.getNewArrival().then((newProducts) => {
          res.render('user/home', { user, userNav: true, cakes, furnitures, paintings, newProducts })
        })
      })
    })
  })
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    let loginSignupPage = true
    res.render('user/login', { 'loginErr': req.session.loginErr, loginSignupPage })
  }
})

router.post('/login', (req, res) => {
  userHelper.logIn(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/')
    } else {
      req.session.loginErr = 'Invalid email address or password'
      res.redirect('/login')
    }
  })
})

router.get('/signup', (req, res) => {
  let loginSignupPage = true
  res.render('user/signup', { loginSignupPage })
})

router.post('/signup', (req, res) => {
  userHelper.signUp(req.body).then((response) => {
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect('/login')
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/showProduct/:productId', (req, res) => {
  let user = req.session.user, userNav = true
  userHelper.getproductDetails(req.params.productId).then((productDetails) => {
    userHelper.getReviews(req.params.productId).then((reviews) => {
      res.render('user/showProduct', { user, userNav, productDetails, reviews })
    })
  })
})

router.get("/deliveryDetails/:price/:productId/:adminId/:productName", (req, res) => {
  let user = req.session.user, userNav = true
  if (req.session.loggedIn) {
    res.render('user/deliveryDetails', { user, userNav, 'price': req.params.price, 'productId': req.params.productId, 'adminId': req.params.adminId, 'productName': req.params.productName })
  } else {
    res.redirect('/login')
  }
})

router.get('/orders', (req, res) => {
  let user = req.session.user, userNav = true
  if (req.session.loggedIn) {
    userHelper.getOrders(req.session.user.userId).then((orderDetails) => {
      res.render('user/orders', { user, userNav, orderDetails })
    })
  } else {
    res.redirect('/login')
  }
})

router.post('/deliveryDetails', (req, res) => {
  if (req.session.user) {
    userHelper.saveOrderDetails(req.body, req.session.user.userId).then((orderId) => {
      if (req.body.paymentMethod === 'COD') {
        res.json({ codSuccess: true })
      } else {
        userHelper.generateRazorpay(orderId, req.body.price).then((response) => {
          res.json(response)
        })
      }
    })
  }
})

router.post('/verifyPayment', (req, res) => {
  userHelper.verfifyPayment(req.body).then((orderId) => {
    userHelper.changePaymentStatus(orderId).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false, errMsg: '' })
  })
})

router.get('/cart', (req, res) => {
  if (req.session.user) {
    let user = req.session.user, userNav = true;

    totalPrice = 0
    userHelper.getCartProducts(req.session.user.userId).then((products) => {
      res.render('user/cart', { user, userNav, products })
    })
  } else {
    res.redirect('/login')
  }
})

router.get("/category", (req, res) => {
  let user = req.session.user, userNav = true
  res.render('user/category', { user, userNav })
})

router.get('/addToCart/:id/:productName/:price', (req, res, next) => {
  if (req.session.user) {
    userHelper.addToCart(req.params.id, req.session.user.userId, req.params.productName, req.params.price).then((status) => {
      res.json(status)
    })
  } else {
    res.json('Error')
  }
})

router.get('/deleteCartItem/:id', (req, res) => {
  userHelper.deleteCartProduct(req.params.id, req.session.user.userId).then((status) => {
    res.redirect('/cart')
  })
})

router.get('/showMore/:name', (req, res) => {
  user = req.session.user, userNav = true
  userHelper.showMoreProducts(req.params.name).then((products) => {
    res.render('user/showProducts', { userNav, user, products })
  })
})

router.post('/search', (req, res) => {
  user = req.session.user, userNav = true
  userHelper.getProductByName(req.body.name).then((products) => {
    res.render('user/showProducts', { userNav, user, products, "keyword": req.body.name })
  })
})

router.get('/userDetails/:username', (req, res) => {
  if (req.session.user) {
    user = req.session.user, userNav = true
    res.render('user/userDetails', { userNav, user })
  } else {
    res.redirect('/login')
  }
})

router.get('/editDetails/:username', (req, res) => {
  if (req.session.user) {
    user = req.session.user, userNav = true
    res.render('user/editAccountDetails', { userNav, user })
  } else {
    res.redirect('/login')
  }
})

router.post('/editDetails', (req, res) => {
  userId = req.session.user.userId
  userHelper.updateDetails(req.body, req.session.user.userId).then(() => {
    req.session.user = req.body
    req.session.user.userId = userId
    res.redirect('/')
  })
})

router.get('/shopByPrice/:price', (req, res) => {
  user = req.session.user, userNav = true
  userHelper.shopByPrice(req.params.price).then((products) => {
    res.render('user/showProducts', { userNav, user, products })
  })
})

router.get('/cancelOrder/:orderId', (req, res) => {
  if (req.session.user) {
    userHelper.cancelOrder(req.params.orderId).then(() => {
      res.redirect('/orders')
    })
  }
})

router.post('/addReview', (req, res) => {
  userHelper.addReview(req.body).then((status) => {
    res.json(status)
  })
})

router.get('/aboutUs', (req, res) => {
  let userNav = true, user = req.session.user
  res.render('aboutUs', { userNav, user })
})


module.exports = router;
