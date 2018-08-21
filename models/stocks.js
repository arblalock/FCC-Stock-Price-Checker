const mongoose = require('mongoose')
const Schema = mongoose.Schema

let stockSchema = new Schema({
  stock: {type: String, required: true, unique: true},
  likes: {type: Number, required: true, default: 0},
  ips: {type: [String], required: true, default: []}
})

if (process.env.NODE_ENV === 'test') {
  module.exports = mongoose.model('test_stocks', stockSchema)
} else {
  module.exports = mongoose.model('stocks', stockSchema)
}
