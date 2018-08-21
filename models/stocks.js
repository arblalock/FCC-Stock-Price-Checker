const mongoose = require('mongoose')
const Schema = mongoose.Schema

let stockSchema = new Schema({
  stock: {type: String, required: true, unique: true},
  likes: {type: Number, required: true, default: 0},
  ips: {type: [String], required: true, default: []}
})

module.exports = mongoose.model('stocks', stockSchema)
