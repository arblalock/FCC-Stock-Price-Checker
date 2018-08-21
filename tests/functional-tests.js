/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http')
var chai = require('chai')
var assert = chai.assert
var server = require('../server')
chai.use(chaiHttp)

suite('Functional Tests', function () {
  suite('GET /api/stock-prices => stockData object', function () {
    this.timeout(0)
    // Dont hit the api too quick, set timeout between tests
    let timeOut = 15000
    let sName1 = 'goog'
    let sName2 = 'MSFT'
    let currLikes = null

    test('1 stock', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: sName1 })
        .end(function (err, res) {
          if (err) return console.error(err)
          assert.equal(res.status, 200, 'server responds')
          assert.property(res.body.stockData, 'stock', 'returns stock name')
          assert.property(res.body.stockData, 'price', 'returns stock price')
          assert.property(res.body.stockData, 'likes', 'returns stock likes')
          assert.equal(res.body.stockData.stock, 'GOOG', 'stock name is correct')
          setTimeout(function () {
            done()
          }, timeOut)
        })
    })
    test('1 stock with like', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: sName1, like: true})
        .end((err, res) => {
          if (err) return console.error(err)
          assert.equal(res.status, 200, 'server responds')
          assert.property(res.body.stockData, 'stock', 'returns stock name')
          assert.property(res.body.stockData, 'price', 'returns stock price')
          assert.equal(res.body.stockData.stock, 'GOOG', 'stock name is correct')
          assert.isAbove(res.body.stockData.likes, 0, 'likes are greater than zero')
          currLikes = res.body.stockData.likes
          setTimeout(function () {
            done()
          }, timeOut)
        })
    })

    test('1 stock with like again (ensure likes arent double counted)', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: sName1, like: true})
        .end((err, res) => {
          if (err) return console.error(err)
          assert.equal(res.status, 200, 'server responds')
          assert.property(res.body.stockData, 'stock', 'returns stock name')
          assert.property(res.body.stockData, 'price', 'returns stock price')
          assert.equal(res.body.stockData.stock, 'GOOG', 'stock name is correct')
          assert.equal(res.body.stockData.likes, currLikes, 'likes are not counted more than once')
          setTimeout(function () {
            done()
          }, timeOut)
        })
    })

    test('2 stocks', function (done) {
    //  this.timeout(0)
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: [sName1, sName2], like: false})
        .end(function (err, res) {
          if (err) return console.error(err)
          assert.equal(res.status, 200, 'server responds')
          assert.property(res.body.stockData[0], 'stock', 'returns stock name')
          assert.property(res.body.stockData[1], 'stock', 'returns stock name')
          assert.property(res.body.stockData[0], 'price', 'returns stock price')
          assert.property(res.body.stockData[1], 'price', 'returns stock price')
          assert.property(res.body.stockData[0], 'rel_likes', 'returns likes')
          assert.property(res.body.stockData[1], 'rel_likes', 'returns likes')
          assert.equal(res.body.stockData[0].stock, 'GOOG', 'stock name is correct')
          assert.equal(res.body.stockData[1].stock, 'MSFT', 'stock name is correct')
          setTimeout(function () {
            done()
          }, timeOut)
        })
    })

    test('2 stocks with like', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: [sName1, sName2], like: true})
        .end((err, res) => {
          if (err) return console.error(err)
          assert.equal(res.status, 200, 'server responds')
          assert.property(res.body.stockData[0], 'stock', 'returns stock name')
          assert.property(res.body.stockData[1], 'stock', 'returns stock name')
          assert.property(res.body.stockData[0], 'price', 'returns stock price')
          assert.property(res.body.stockData[1], 'price', 'returns stock price')
          assert.property(res.body.stockData[0], 'rel_likes', 'returns likes')
          assert.property(res.body.stockData[1], 'rel_likes', 'returns likes')
          assert.equal(res.body.stockData[0].stock, 'GOOG', 'stock name is correct')
          assert.equal(res.body.stockData[1].stock, 'MSFT', 'stock name is correct')
          done()
        })
    })
  })
})
