var express = require('express');
const { response } = require('../app');
const fs = require('fs')
var router = express.Router();
var productHelper = require('../helpers/productHelper');
const userHelper = require('../helpers/userHelper');
const { route } = require('./user');


const verifyLogin = (req, res, next) => {
  if (req.session.loggedInAdmin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

router.get('/', function (req, res, next) {
  if (req.session.admin) {
    req.session.loggedInAdmin = true;
    let adminNav = true, admin = req.session.admin
    productHelper.getAllProducts(admin.adminId).then((data) => {
      res.render('admin/allProducts', { admin, adminNav, data })
    })
  } else {
    res.redirect('/admin/login')
  }
});

router.get('/login', (req, res) => {
  if (req.session.admin)
    res.redirect('/admin')
  res.render('admin/login', { loginSignupPage: true, 'loginErr': req.session.loginErrAdmin })
})

router.post('/login', (req, res) => {
  productHelper.logIn(req.body).then((response) => {
    if (response.adminStatus) {
      req.session.loggedInAdmin = true;
      req.session.admin = response.admin;
      res.redirect('/admin')
    } else {
      req.session.loggedInAdmin = false
      req.session.loginErrAdmin = 'Invalid email address or password'
      res.redirect('/admin/login')
    }
  })
})

router.get('/signup', (req, res) => {
  res.render('admin/signUp')
})

router.post('/signup', (req, res) => {
  productHelper.signUp(req.body).then((adminId) => {
    req.session.admin = req.body
    req.session.admin.adminId = adminId
    req.session.loggedInAdmin = true;
    res.redirect('/admin')
  })
})

router.get('/add-product', verifyLogin, (req, res) => {
  let adminNav = true, admin = req.session.admin
  res.render('admin/addProduct', { admin, adminNav })
})

router.post('/add-product', (req, res) => {
  req.body.adminId = req.session.admin.adminId

  if (req.body.imgCount > 5)
    req.body.imgCount = 5

  productHelper.addProduct(req.body).then((productId) => {
    if (req.body.imgCount == 1) {
      req.files.Image.mv('./public/productImages/' + productId + '.jpg', (err, done) => {
        if (err) {
          console.log(err)
        }
      })
    } else {
      for (i = 0; i < req.body.imgCount; i++) {
        if (i === 0) {
          req.files.Image[i].mv('./public/productImages/' + productId + '.jpg', (err, done) => {
            if (err) {
              console.log(err)
            }
          })
        } else {
          req.files.Image[i].mv('./public/productImages/product' + productId + i + '.jpg', (err, done) => {
            if (err) {
              console.log(err)
            }
          })
        }
      }
    }
  })

  res.redirect('/admin/add-product')
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/admin')
})

router.get('/edit-product/:id', verifyLogin, (req, res) => {
  let adminNav = true, admin = req.session.admin
  productHelper.getProductDetails(req.params.id).then((product) => {
    res.render('admin/editProduct', { admin, adminNav, product })
  })
})

router.post('/edit-product/:id', (req, res) => {
  req.body.productId = req.params.id
  productHelper.editProduct(req.body).then(() => {
    res.redirect('/admin')
  })
})


router.get('/delete-product/:id/:imgCount', (req, res) => {

  productHelper.deleteProduct(req.params.id).then(() => {
    let filePath1 = './public/productImages/' + req.params.id + '.jpg'
    if (req.params.imgCount === 1) {
      fs.unlink(filePath1, function (err) {
        if (err) {
          console.log("Error occured while deleting " + filePath1)
        } else {
          console.log(filePath1 + " Deleted")
        }
      })
    } else {
      fs.unlink(filePath1, function (err) {
        if (err) {
          console.log("Error occured while deleting " + filePath1)
        } else {
          console.log(filePath1 + " Deleted")
        }
      })

      for (i = 1; i < req.params.imgCount; i++) {
        let filePath = './public/productImages/product' + req.params.id + i +'.jpg'
        fs.unlink(filePath, function (err) {
          if (err) {
            console.log("Error occured while deleting " + filePath)
          } else {
            console.log(filePath + " Deleted")
          }
        })
      }
    }
  })
  res.redirect('/admin')

})
router.get('/account/:userName', verifyLogin, (req, res) => {
  let adminNav = true, admin = req.session.admin
  res.render('admin/adminAccount', { admin, adminNav })
})


router.get('/orders', verifyLogin, async (req, res) => {
  productHelper.getAllOrders(req.session.admin.adminId).then((allOrders) => {
    let adminNav = true, admin = req.session.admin
    res.render('admin/orders', { admin, adminNav, allOrders })
  })
})

router.get("/editDetails", verifyLogin, (req, res) => {
  admin = req.session.admin
  adminNav = true;
  res.render('admin/editAccountDetails', { admin, adminNav })
})

router.post('/editDetails', (req, res) => {
  adminId = req.session.admin.adminId
  productHelper.updateDetails(req.body, req.session.admin.adminId).then(() => {
    req.session.admin = req.body
    req.session.admin.adminId = adminId
    res.redirect('/admin')
  })
})

router.post('/changeOrderStatus', (req, res) => {
  productHelper.changeOrderStatus(req.body).then((status) => {
    res.json(status)
  })
})

router.get('/aboutUs', (req, res) => {
  let adminNav = true, admin = req.session.admin
  res.render('aboutUs', { adminNav, admin })
})

module.exports = router;
