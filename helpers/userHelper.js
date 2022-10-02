const bcrypt = require('bcrypt');
const { resolve, reject } = require('promise');
const { use, response } = require('../app');
var connection = require('../config/connection')
var Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_4EQQMYs1T5GbHq',
    key_secret: 'XKLddpct7xOsPOQm0TUu6vSo'
})


module.exports = {

    signUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            data = [userData.name, userData.phone, userData.email, userData.gender, userData.password]
            var sqlStmt = `
                insert into user (
                    name, phone, email, gender, password
                )
                values
                (
                    ?, ?, ?, ?, ?

                )
            `;
            connection.query(sqlStmt, data, (err, rows, feild) => {
                if (err) {
                    resolve(err)
                } else {
                    userData.userId = rows.insertId
                    resolve(userData)
                }
            })
        })
    },

    logIn: (userData) => {
        return new Promise((resolve, reject) => {
            let loginStatus = false
            let response = {}
            var sqlStmt = `select * from user where email = ?`;
            connection.query(sqlStmt, userData.email, function (err, rows, fields) {
                if (err) {
                    resolve()
                } else {
                    if (rows.length > 0) {
                        bcrypt.compare(userData.password, rows[0].password).then((status) => {
                            if (status) {
                                response.user = rows[0];
                                response.status = true;
                                resolve(response)
                            } else {
                                resolve({ status: false })
                            }
                        })
                    } else {
                        resolve({ status: false })
                    }
                }
            })

        })
    },

    getNewArrival: () => {
        return new Promise((resolve, reject) => {
            var sqlStmt = 'select * from products order by productId desc limit 3';
            connection.query(sqlStmt, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve(rows)
                }
            })
        })
    }
    ,
    getFoodsForYou: () => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `select productId, price from products where category = 'Food' limit 4`;
            connection.query(sqlStmt, (err, rows) => {
                if (err)
                    resolve()
                else
                    resolve(rows)
            })
        })
    },

    getFurnituresForYou: () => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `select productId, price from products where category = 'Furniture' limit 4`;
            connection.query(sqlStmt, (err, rows) => {
                if (err)
                    resolve()
                else
                    resolve(rows)
            })
        })
    },

    getPaintingsForYou: () => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `select productId, price from products where category = 'Paintings' limit 4`;
            connection.query(sqlStmt, (err, rows) => {
                if (err)
                    resolve()
                else
                    resolve(rows)
            })
        })
    },

    getproductDetails: (productId) => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `select * from products where productId = ?`;
            connection.query(sqlStmt, productId, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve(rows[0])
                }
            })
        })
    },

    saveOrderDetails: (details, userId) => {
        return new Promise(async (resolve, reject) => {
            let status;
            if (details.paymentMethod === 'COD') {
                status = 'Placed'
            } else {
                status = 'Pending'
            }

            details.price = parseInt(details.price)
            date = new Date().toDateString();
            let data = [details.adminId, userId, details.productId, details.address, details.district, status, details.paymentMethod, details.price, date]
            var sqlStmt = `
                    insert into orders
                    (
                        adminId, userId,
                        productId, address, 
                        district, status,
                        payment_method,
                        price, date
                    )
                    values
                    (
                            ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )`;
            connection.query(sqlStmt, data, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve(rows.insertId)
                }
            })
        })
    },

    getOrders: (userId) => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `select * from orders where userId = ? order by orderId desc`;
            connection.query(sqlStmt, userId, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    for (i in rows) {
                        if (rows[i].status === 'Order Placed') {
                            rows[i].status = "Paid"
                        }
                    }
                    resolve(rows)
                }
            })
        })
    },

    addToCart: (productId, userId, productname, price) => {
        return new Promise((resolve, reject) => {
            data = [userId, productId, productname, price]
            var sqlStmt = `insert into cart values(?, ?, ?, ?)`;
            connection.query(sqlStmt, data, (err, rows) => {
                if (err) {
                    resolve('Error')
                } else {
                    resolve({ status: true })
                }
            })
        })
    },

    deleteCartProduct: (productId, userId) => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `DELETE FROM cart WHERE productId=? AND cartNo = ?`;
            connection.query(sqlStmt, [productId, userId], (err, rows) => {
                if (err) {
                    resolve('Error')
                } else {
                    resolve({ status: true })
                }
            })
        })
    },

    getCartProducts: (userId) => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `select productId, productName, price from cart where cartNo = ?`;
            connection.query(sqlStmt, userId, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve(rows)
                }
            })
        })
    },

    showMoreProducts: (name) => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `select * from products where category = ?`
            connection.query(sqlStmt, name, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve(rows)
                }
            })
        })
    },

    getProductByName: (name) => {
        name = '%' + name + '%'
        return new Promise((resolve, reject) => {
            var sqlStmt = `select * from products where name like ? or category like ?`;
            connection.query(sqlStmt, [name, name], (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve(rows)
                }
            })
        })
    },

    updateDetails: (details, userId) => {
        return new Promise((resolve, reject) => {
            data = [details.name, details.phone, details.email, userId]
            var sqlStmt = `
                UPDATE user SET name = ?, phone = ?, email = ?
                WHERE userId = ?
            `;

            connection.query(sqlStmt, data, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve()
                }
            })
        })
    },

    shopByPrice: (price) => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `select * from products where price <= ?`;
            connection.query(sqlStmt, price, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve(rows)
                }
            })
        })
    },

    cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `delete from orders where orderId = ?`;
            connection.query(sqlStmt, orderId, (err) => {
                if (err) {
                    resolve()
                } else {
                    resolve()
                }
            })
        })
    },

    generateRazorpay: (orderId, totalPrice) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: totalPrice * 100,
                currency: "INR",
                receipt: orderId
            }
            instance.orders.create(options, function (err, order) {
                if (err) {
                    resolve()
                } else {
                    console.log(order)
                    resolve(order)
                }
            })
        })
    },

    verfifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            var crypto = require('crypto');
            var hmac = crypto.createHmac('sha256', 'XKLddpct7xOsPOQm0TUu6vSo')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')

            if (hmac == details['payment[razorpay_signature]']) {
                resolve(details['order[receipt]'])
            } else {
                reject()
            }
        })
    },

    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            data = ['Placed', orderId]
            var sqlStmt = `
                UPDATE orders SET status = ?
                WHERE orderid = ?
            `;
            connection.query(sqlStmt, data, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    console.log(rows)
                    resolve()
                }
            })
        })
    },

    addReview: (details) => {
        return new Promise((resolve, reject) => {
            var data = [details.review, details.orderId]
            var sqlStmt = `
                UPDATE orders SET review = ?
                WHERE orderid = ?
            `;

            connection.query(sqlStmt, data, (err, rows) => {
                if(err) {
                    resolve({status:false})
                } else {
                    resolve({status:true})
                }
            })  
        })
    },

    getReviews: (productId) => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `
                select review from orders where productId = ? and review is not null
            `;

            connection.query(sqlStmt, productId, (err, rows) => {
                if(err) {
                    resolve()
                } else {
                    resolve(rows)
                }
            })
        })
    }

}
