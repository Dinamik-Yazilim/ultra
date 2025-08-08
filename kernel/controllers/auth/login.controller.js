const { saveSession } = require('./helper')
const { sendAuthEmail, sendAuthSms } = require('../../lib/sender')
module.exports = (req) =>
  new Promise(async (resolve, reject) => {
    try {
      if (req.method != 'POST') return restError.method(req, reject)

      let organization = util.fixOrganizationName(req.getValue('organization') || '')
      let email = null
      let phoneNumber = null
      let username = req.getValue('username')

      if (!username) return reject('username required')
      let orgDoc = null
      if (organization) {
        orgDoc = await db.organizations.findOne({ name: organization })
        if (!orgDoc) return reject('organization not found')
      }

      username = req.getValue('username')

      if (username.includes('@')) {
        username = username.trim()
      } else if (!isNaN(username)) {
        username = util.fixPhoneNumber(username)
      } else {
        return reject('username error')
      }
      let password = req.getValue('password')
      let deviceId = req.getValue('deviceId')

      let memberDoc = null
      if (orgDoc) {
        memberDoc = await db.members.findOne({ organization: orgDoc._id, username: username })
        if (!memberDoc) return reject(`login failed. member not found.`)
      } else {
        memberDoc = await db.members.findOne({ organization: null, username: username })
        if (!memberDoc) return reject(`admin login failed. admin member not found.`)
        if (!['sysadmin', 'sysuser'].includes(memberDoc.role)) return reject(`permission denied`)
      }

      if (memberDoc.passive) return reject(`account is passive. please contact with administrators`)


      // TODO: buraya gelecekte saatte istenebilecek veya gunluk istenebilecek sms/email limiti koyalim
      // TODO: resolve mesaj icindeki authCode bilgileri kaldirilacak.
      let authCodeDoc = await db.authCodes.findOne({
        organization: orgDoc && orgDoc._id || null,
        username: username,
        deviceId: deviceId,
        verified: false,
        passive: false,
        authCodeExpire: { $gt: new Date() },
      })
      if (authCodeDoc) {
        return resolve(`authCode already has been sent. authCode:${authCodeDoc.authCode} username:${authCodeDoc.username}`)
      } else {
        authCodeDoc = new db.authCodes({
          organization: orgDoc && orgDoc._id || null,
          deviceId: deviceId,
          username: username,
          authCode: util.randomNumber(120000, 980700),
          authCodeExpire: new Date(new Date().setMinutes(new Date().getMinutes() + 55)), // TODO: 3 dk ya indirilecek. simdilik 55 dk
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
