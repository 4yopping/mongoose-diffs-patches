'use strict'

const co = require('co')
const faker = require('faker')
const User = require('./models/user')
const utils = require('./lib/utils')
const chalk = require('chalk')
const jiff = require('jiff')

co(function * () {
  // Create user
  let user = yield User.create({
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email()
  })

  console.log(chalk.bgCyan.black('  Current user  '))
  console.log(chalk.cyan(JSON.stringify(user, null, 2)))

  // Wait for update
  yield utils.sleep(500)

  // Update lastname
  console.log(chalk.inverse('\n      Updating user...      \n'))
  yield user.update({
    $set: {
      lastname: faker.name.lastName()
    }
  })

  // Wait for another update
  yield utils.sleep(500)

  // Add email and change lastname
  console.log(chalk.inverse('\n      Updating user...      \n'))
  yield User.findByIdAndUpdate(user._id, {
    lastname: faker.name.lastName(),
    email: faker.internet.email()
  })

  // Wait for another update
  yield utils.sleep(500)

  // Remove email and change firstname
  console.log(chalk.inverse('\n      Updating user...      \n'))
  yield User.findByIdAndUpdate(user._id, {
    $unset: { email: '' },
    $set: {
      firstname: faker.name.firstName()
    }
  })

  // Wait for saving changes
  yield utils.sleep(500)

  user = yield User.findById(user._id)
  console.log(chalk.inverse('\n      Making a patch revision      \n'))

  // Sort revisions ascending
  user.history.sort(utils.asc)
  let revisions = user.history

  // Get user without unneeded properties
  user = yield User.findById(user._id, '-_id -__v -updatedAt -createdAt -history', { lean: true })
  // Clone user object to be patched
  let patched = Object.assign({}, user)

  for (let revision of revisions) {
    patched = jiff.patch(revision.changes, patched)
  }

  console.log(chalk.bgGreen.black('  Last user version  '))
  console.log(chalk.green(JSON.stringify(user, null, 2)))
  console.log(chalk.bgCyan.black('  First user version  '))
  console.log(chalk.cyan(JSON.stringify(patched, null, 2)))
})
