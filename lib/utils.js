'use strict'

module.exports = {
  sleep: function (timeout) {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, timeout)
    })
  },

  asc: function (a, b) {
    a = new Date(a.date).getTime()
    b = new Date(b.date).getTime()
    return a > b ? -1 : 1
  }
}
