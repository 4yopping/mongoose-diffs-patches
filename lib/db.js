'use strict'

const mongoose = require('mongoose')
const conf = require('../conf').mongo

mongoose.Promise = Promise
mongoose.connect(conf.url)

mongoose.connection.on('error', console.error)
mongoose.connection.once('open', function () {
  console.info(`Mongo connected to ${conf.url}`)
})

module.exports = mongoose
