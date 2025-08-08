exports.dateTime = function (clientId, clientPass) {
  return new Promise((resolve, reject) => {
    try {
      fetch(`${process.env.CONNECTOR_API}/datetime`, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
          clientId: clientId,
          clientPass: clientPass
        },
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            resolve(result.data)
          } else {
            reject(result.error)
          }
        })
        .catch(reject)

    } catch (err) {
      reject(err)
    }
  })
}

exports.mssql = function (clientId, clientPass, config, query) {
  return new Promise((resolve, reject) => {
    try {
      if (config && !config.options) {
        config.options = { encrypt: false, trustServerCertificate: true }
      }
      fetch(`${process.env.CONNECTOR_API}/mssql`, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
          clientId: clientId,
          clientPass: clientPass
        },
        body: JSON.stringify({ config: config, query: query })
      })
        .then(res => res.json())
        .then(result => {

          if (result.success) {
            resolve(result.data)
          } else {
            reject(result.error)
          }
        })
        .catch(reject)

    } catch (err) {
      reject(err)
    }
  })
}