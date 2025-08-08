module.exports = (dbModel, sessionDoc, req) =>
  new Promise(async (resolve, reject) => {

    switch (req.method.toUpperCase()) {
      case 'GET':
        if (req.params.param1 != undefined) {
          getOne(dbModel, sessionDoc, req).then(resolve).catch(reject)
        } else {
          getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
        }
        break
      case 'POST':
        if (req.params.param1 == 'connect') {
          connectOrg(dbModel, sessionDoc, req).then(resolve).catch(reject)
        } else {
          post(dbModel, sessionDoc, req).then(resolve).catch(reject)
        }


        break
      case 'PUT':
        put(dbModel, sessionDoc, req).then(resolve).catch(reject)
        break
      case 'DELETE':
        deleteItem(dbModel, sessionDoc, req).then(resolve).catch(reject)
        break
      default:
        restError.method(req, reject)
        break
    }
  })

function connectOrg(dbModel, sessionDoc, req) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!req.params.param2) return reject(`param2 required`)
      const orgDoc = await dbModel.organizations.findOne({ _id: req.params.param2 })
      if (!orgDoc) return reject(`organization not found`)
      if (orgDoc.passive) return reject(`organization is not active`)
      sessionDoc.organization = orgDoc._id
      sessionDoc.save()
        .then(() => {
          let obj = orgDoc.toJSON()
          delete obj.connector
          delete obj.settings
          resolve(obj)
        })
        .catch(reject)
    } catch (err) {
      reject(err)
    }

  })
}

function getOne(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    dbModel.organizations
      .findOne({ _id: req.params.param1, organization: sessionDoc.organization })
      .then(resolve)
      .catch(reject)
  })
}

function getList(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    let options = {
      page: req.query.page || 1,
      limit: req.query.pageSize || 10,
      sort: { name: 1 }
    }
    let filter = {}
    if (req.query.passive != undefined) {
      if (req.query.passive.toString() == 'false') filter.passive = false
      if (req.query.passive.toString() == 'true') filter.passive = true
    }

    if (req.query.name || req.query.search) {
      filter.$or = [
        { name: { $regex: `.*${req.query.name || req.query.search}.*`, $options: 'i' } },
        { location: { $regex: `.*${req.query.name || req.query.search}.*`, $options: 'i' } }
      ]

    }
    dbModel.organizations
      .paginate(filter, options)
      .then(resolve).catch(reject)
  })
}

function post(dbModel, sessionDoc, req) {
  return new Promise(async (resolve, reject) => {
    try {

      let data = req.body || {}
      delete data._id
      data.name = (data.name || '').toLowerCase().replace(/[^a-z0-9\-\_]/g, '')
      if (!data.name) return reject('name required')
      if (await dbModel.organizations.countDocuments({ name: data.name }) > 0)
        return reject(`name already exists`)

      const newDoc = new dbModel.organizations(data)
      newDoc.save()
        .then(resolve)
        .catch(reject)
    } catch (err) {
      reject(err)
    }

  })
}

function put(dbModel, sessionDoc, req) {
  return new Promise(async (resolve, reject) => {
    try {

      if (req.params.param1 == undefined) return restError.param1(req, reject)
      let data = req.body || {}
      delete data._id

      let doc = await dbModel.organizations.findOne({ _id: req.params.param1 })
      if (!doc) return reject(`organization not found`)
      if (data.name) {
        data.name = (data.name || '').toLowerCase().replace(/[^a-z0-9\-\_]/g, '')
        if (!data.name) return reject('name required')
      }

      Object.assign(doc, data)
      if (await dbModel.organizations.countDocuments({ name: doc.name, _id: { $ne: doc._id } }) > 0)
        return reject(`name already exists`)

      doc.save()
        .then(resolve)
        .catch(reject)
    } catch (err) {
      reject(err)
    }

  })
}

function deleteItem(dbModel, sessionDoc, req) {
  return new Promise(async (resolve, reject) => {
    try {
      if (req.params.param1 == undefined) return restError.param1(req, reject)

      dbModel.organizations.removeOne(sessionDoc, { _id: req.params.param1 })
        .then(resolve)
        .catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}
