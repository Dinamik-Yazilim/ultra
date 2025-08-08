const { getList, executeSql } = require('../../lib/mikro/mikroHelper')
module.exports = (dbModel, sessionDoc, req, orgDoc) =>
  new Promise(async (resolve, reject) => {

    switch (req.params.param1) {
      case 'get':
        getList(sessionDoc, orgDoc, req.getValue('query'), '').then(resolve).catch(reject)
        break
      case 'getWorkData':
        getList(sessionDoc, orgDoc, req.getValue('query'), '_WORKDATA').then(resolve).catch(reject)
        break
      case 'save':
        executeSql(sessionDoc, orgDoc, req.getValue('query'), '').then(resolve).catch(reject)
        break
      case 'saveWorkData':
        executeSql(sessionDoc, orgDoc, req.getValue('query'), '_WORKDATA').then(resolve).catch(reject)
        break
      default:
        restError.method(req, reject)
        break
    }
  })

