global.mongoose = require('mongoose')
global.mongoosePaginate = require('mongoose-paginate-v2')
global.mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')
mongoosePaginate.paginate.options = {
  customLabels: {
    totalDocs: 'totalDocs',
    limit: 'pageSize',
    page: 'page',
    totalPages: 'pageCount',
    docs: 'docs',
    nextPage: 'false',
    prevPage: 'false',
    pagingCounter: 'false',
    hasPrevPage: 'false',
    hasNextPage: 'false',
    meta: null,
  },
  lean: true,
  leanWithId: false,
  limit: 10,
  allowDiskUse: true,
}
global.ObjectId = mongoose.Types.ObjectId

global.dbNull = require('./helpers/db-util').dbNull
global.epValidateSync = require('./helpers/db-util').epValidateSync
global.sendToTrash = require('./helpers/db-util').sendToTrash
const { connectMongoDatabase, mo } = require('./helpers/db-util')
global.repoHolder = {}


mongoose.set('debug', false)
mongoose.Schema.Types.String.set('trim', true)

process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    eventLog('Mongoose default connection disconnected through app termination')
    process.exit(0)
  })
})

global.db = {
  get nameLog() {
    return `[MongoDB]`.cyan
  },
}

module.exports = () =>
  new Promise((resolve, reject) => {
    connectMongoDatabase(path.join(__dirname, 'collections'), process.env.MONGODB_URI, db)
      .then(() => {
        resolve()
      })
      .catch(reject)
  })





