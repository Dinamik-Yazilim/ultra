const { saveSession } = require('./helper')
const { sendAuthEmail, sendAuthSms } = require('../../lib/sender')
module.exports = (req) =>
  new Promise(async (resolve, reject) => {
    try {
      if (req.method != 'POST') return restError.method(req, reject)

      let organization = util.fixOrganizationName(req.getValue('organization') || '')
      let partner = util.fixOrganizationName(req.getValue('partner') || '')
      let username = req.getValue('username')

      if (!username) return reject('username required')
      let orgDoc = null
      if (organization) {
        orgDoc = await db.organizations.findOne({ name: organization })
        if (!orgDoc) return reject('organization not found')
      }

      let partnerDoc = null
      if (partner) {
        partnerDoc = await db.partners.findOne({ name: partner })
        if (!partnerDoc) return reject('partner not found')
      }

      username = req.getValue('username')

      if (username.includes('@')) {
        username = username.trim()
      } else if (!isNaN(username)) {
        username = util.fixPhoneNumber(username)
      } else {
        return reject('username error')
      }
      let deviceId = req.getValue('deviceId')

      let memberDoc = await db.members.findOne({
        partner: partnerDoc ? partnerDoc._id : null,
        organization: orgDoc ? orgDoc._id : null,
        username: username
      })
      if (!memberDoc) return reject(`login failed. member not found.`)
      if (!memberDoc.organization && !memberDoc.partner && !memberDoc.role.startsWith('sys'))
        return reject(`permission denied`)

      if (memberDoc.passive) return reject(`account is passive. please contact with administrators`)


      let authCodeDoc = await db.authCodes.findOne({
        partner: partnerDoc ? partnerDoc._id : null,
        organization: orgDoc ? orgDoc._id : null,
        username: username,
        deviceId: deviceId,
        verified: false,
        passive: false,
        authCodeExpire: { $gt: new Date() },
      })


      if (authCodeDoc) {
        return resolve(`authCode already has been sent to username:${authCodeDoc.username}`)
      } else {
        authCodeDoc = new db.authCodes({
          partner: partnerDoc ? partnerDoc._id : null,
          organization: orgDoc ? orgDoc._id : null,
          deviceId: deviceId,
          username: username,
          authCode: util.randomNumber(120000, 980700),
          authCodeExpire: new Date(new Date().setMinutes(new Date().getMinutes() + 55)),
        })
        authCodeDoc = await authCodeDoc.save()
      }
      if (authCodeDoc.username.includes('@')) {
        sendAuthEmail(authCodeDoc.username, authCodeDoc.authCode)
          .then((result) => {
            devLog('login email result:', result)
            return resolve(`authCode has been sent to your email. authCode:${authCodeDoc.authCode} username:${authCodeDoc.username}`)
          })
          .catch(reject)
      } else if (!isNaN(authCodeDoc.username)) {
        sendAuthSms(authCodeDoc.username, authCodeDoc.authCode)
          .then((result) => {
            devLog('login sms result:', result)
            return resolve(`authCode has been sent to your phone. authCode:${authCodeDoc.authCode} username:${authCodeDoc.username}`)
          })
          .catch(reject)

      } else {
        reject('username authCode error') // TODO: buraya daha anlamli bir hata mesaji lutfen
      }
    } catch (err) {
      reject(err)
    }
  })
