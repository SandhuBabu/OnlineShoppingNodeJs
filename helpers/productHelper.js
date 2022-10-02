const bcrypt = require('bcrypt');
const { resolve, reject } = require('promise');
const { use, response } = require('../app');
var connection = require('../config/connection')


module.exports = {
    signUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            data = [userData.name, userData.phone, userData.email, userData.gender, userData.password]
            var sqlStmt = `
                insert into admin (name, phone, email, gender, password)
                values(?, ?, ?, ?, ?)
            `;
            connection.query(sqlStmt, data, (err, rows) => {
                if (err) {
                    resolve(err)
                } else {
                    rows.insertId
                    resolve(rows.insertId)
                }
            })
        })
    },

    logIn: (userData) => {
        return new Promise((resolve, reject) => {
            let response = {}
            var sqlStmt = `select * from admin where email = ?`;
            connection.query(sqlStmt, userData.email, function (err, rows, fields) {
                if (err) {
                    resolve({ status: false })
                } else {
                    if (rows) {
                        if (rows.length > 0) {
                            bcrypt.compare(userData.password, rows[0].password).then((status) => {
                                if (status) {
                                    response.admin = rows[0];
                                    response.adminStatus = true;
                                    resolve(response)
                                } else {
                                    resolve({ status: false })
                                }
                            })
                        } else {
                            resolve({ status: false })
                        }
                    }
                }
            })
        })
    },

    addProduct: (product) => {
        return new Promise((resolve, reject) => {
            product.price = parseInt(product.price)
            var data = [product.name, product.adminId, product.category, product.price, product.description, product.imgCount]
            var sqlStmt = `
                insert into products (name, adminId, category, price, description, imgCount)
                values(?, ?, ?, ?, ?, ?)
            `;
            connection.query(sqlStmt, data, (err, rows) => {
                if (err)
                    console.log(err)
                    //resolve()
            })
            connection.query('SELECT LAST_INSERT_ID() as productId', (err, rows) => {
                if (err)
                    resolve()
                else
                    resolve(rows[0].productId)
            })
        })
    },

    getAllProducts: (adminId) => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `select * from products where adminId = ? order by productId desc`;
            connection.query(sqlStmt, adminId, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve(rows)
                }
            })
        })
    },

    getProductDetails: (productId) => {
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

    editProduct: (product) => {
        return new Promise((resolve, reject) => {
            product.price = parseInt(product.price)
            var data = [product.name, product.category, product.price, product.description, product.productId]
            var sqlStmt = `
                   UPDATE products SET name = ?, category = ?, price = ?, description = ?
                   WHERE productId = ?
            `;
            connection.query(sqlStmt, data, (err, rows) => {
                if (err)
                    resolve()
                else {
                    resolve()
                }
            })
        })
    },

    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            var sqlStmt = `DELETE FROM products WHERE productId = ?`;
            connection.query(sqlStmt, productId, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve(rows)
                }
            })
        })
    },

    getAllOrders: (adminId) => {
        return new Promise(async (resolve, reject) => {
            var sqlStmt = `select * from orders where adminId = ? order by orderid desc`;
            connection.query(sqlStmt, adminId, (err, rows) => {
                if (err) {
                    resolve()
                } else {
                    resolve(rows)
                }
            })
        })
    },

    updateDetails: (details, adminId) => {
        return new Promise((resolve, reject) => {
            data = [details.name, details.phone, details.email, adminId]
            var sqlStmt = `
                UPDATE admin SET name = ?, phone = ?, email = ?
                WHERE adminId = ?
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

    changeOrderStatus: (details) => {
        return new Promise((resolve, reject) => {
            var data = [details.newStatus, details.orderId]
            var sqlStmt = `
                UPDATE orders SET status = ? WHERE orderId = ?
            `;

            connection.query(sqlStmt, data, (err, rows) => {
                if(err) {
                    resolve({status:false})
                } else {
                    resolve({status: true})
                }
            })
        })
    }
}
