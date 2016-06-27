'use strict'

const db = require('../lib/db')
const Schema = require('mongoose').Schema
const jiff = require('jiff')
const chalk = require('chalk')

const schema = new Schema({
  firstname: String,
  lastname: String,
  email: String,
  history: [{}]
}, {
  timestamps: true
})

/** Middlware to set last document */
schema.setLastDocument = function (next) {
  if (this._update['$push'] && this._update['$push'].history) return next()

  this.findOne(this._conditions, '-__v -createdAt -updatedAt -history', { lean: true }, (err, doc) => {
    if (err) return next(err)
    doc && (this.lastDocument = doc)
    next()
  })
}

/** Middlware to make diff between documents */
schema.diffDocuments = function () {
  if (this._update['$push'] && this._update['$push'].history) return
  if (!this.lastDocument) return

  let updatedAt = new Date()

  this.findOne(this._conditions, '-__v -createdAt -updatedAt -history', { lean: true }, (err, doc) => {
    if (err) return err
    let changes = jiff.diff(doc, this.lastDocument) || []

    console.log(chalk.bgRed.black('  Old  '))
    console.log(chalk.red(JSON.stringify(this.lastDocument, null, 2)))
    console.log(chalk.bgGreen.black('  New  '))
    console.log(chalk.green(JSON.stringify(doc, null, 2)))
    console.log(chalk.bgCyan.black('  Diff  '))
    console.log(chalk.cyan(JSON.stringify(changes, null, 2)))
    changes.updatedAt = updatedAt

    if (changes.length > 0) {
      this.model.update(this._conditions, {
        $push: {
          history: {
            changes: changes,
            updatedAt: new Date()
          }
        }
      }, function () {})
    }
  })
}

schema.pre('update', schema.setLastDocument)
schema.post('update', schema.diffDocuments)
schema.pre('findByIdAndUpdate', schema.setLastDocument)
schema.post('findByIdAndUpdate', schema.diffDocuments)
schema.pre('findOneAndUpdate', schema.setLastDocument)
schema.post('findOneAndUpdate', schema.diffDocuments)

module.exports = db.model('User', schema)
