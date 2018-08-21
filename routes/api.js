'use strict'
// const mongoose = require('mongoose')
const stocks = require('../models/stocks')
const axios = require('axios')
module.exports = function (app, db) {
  app.route('/api/stock-prices')
    .get(function (req, res) {
      let d = new Date()
      d.toUTCString()
      d.setHours(d.getHours() - 4)
      let cDate = d.toISOString().split('T')[0]
      if (req.query.stock instanceof Array) {
        let sName1 = req.query.stock[0].toUpperCase()
        let sName2 = req.query.stock[1].toUpperCase()
        let url1 = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${sName1}&outputsize=compact&apikey=${process.env.STOCK_API}`
        let url2 = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${sName2}&outputsize=compact&apikey=${process.env.STOCK_API}`
        let price1 = null
        let price2 = null
        axios.get(url1)
          .then((response) => {
            if (response.data['Error Message']) {
              res.send('Invalid Stock Name')
              return Promise.reject(new Error('Invalid Stock Name'))
            } else {
              price1 = response['data']['Time Series (Daily)'][cDate]['4. close']
            }
          })
          .then(() => axios.get(url2))
          .then((response) => {
            if (response.data['Error Message']) {
              res.send('Invalid Stock Name')
              return Promise.reject(new Error('Invalid Stock Name'))
            } else {
              price2 = response['data']['Time Series (Daily)'][cDate]['4. close']
            }
          })
          .then(() => findUpdate(req.query.stock[0], req.query.like, req.ip))
          .then((result1) => {
            findUpdate(req.query.stock[1], req.query.like, req.ip)
              .then((result2) => {
                let stock1 = {stock: result1.stock, price: price1, rel_likes: result1.likes - result2.likes}
                let stock2 = {stock: result2.stock, price: price2, rel_likes: result2.likes - result1.likes}
                return res.json({stockData: [stock1, stock2]})
              })
          })
          .catch(error => console.error(error))
      } else {
        let sName = req.query.stock.toUpperCase()
        let url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${sName}&outputsize=compact&apikey=${process.env.STOCK_API}`
        let price = null
        axios.get(url)
          .then((response) => {
            if (response.data['Error Message']) {
              res.send('Invalid Stock Name')
              return Promise.reject(new Error('Invalid Stock Name'))
            } else {
              price = response['data']['Time Series (Daily)'][cDate]['4. close']
            }
          })
          .then(() => findUpdate(sName, req.query.like, req.ip))
          .then((result) => {
            return res.json({stockData: {stock: result.stock, price: price, likes: result.likes}})
          })
          .catch(error => console.error(error))
      }
    })

  function findUpdate (stckName, like, ip) {
    return new Promise(function (resolve, reject) {
      let reqIP = ip.replace('::ffff:', '')
      stckName = stckName.toUpperCase()
      stocks.findOne({stock: stckName}, (err, doc) => {
        if (err) reject(Error(err))
        if (!doc) {
          let sObj = {stock: stckName,
            likes: like ? 1 : 0,
            ips: like ? [reqIP] : []}
          let newStock = stocks(sObj)
          newStock.save((err, newDoc) => {
            if (err) reject(Error(err))
            resolve({stock: newDoc.stock, likes: newDoc.likes})
          })
        } else {
          if (like) {
            if (!doc.ips.includes(reqIP)) {
              stocks.findByIdAndUpdate(doc._id, {$inc: {likes: 1}, $push: {ips: reqIP}}, {new: true}, (err, upDoc) => {
                if (err) reject(Error(err))
                resolve({stock: upDoc.stock, likes: upDoc.likes})
              })
            } else {
              resolve({stock: doc.stock, likes: doc.likes})
            }
          } else {
            resolve({stock: doc.stock, likes: doc.likes})
          }
        }
      })
    })
  }
}
