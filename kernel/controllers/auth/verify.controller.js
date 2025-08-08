const { saveSession } = require('./helper')

module.exports = (req) =>
	new Promise(async (resolve, reject) => {
		try {
			if (!req.method == 'POST') return restError.method(req, reject)
			let authCode = req.getValue('authCode')
			let username = req.getValue('username')
			if (username.includes('@')) {
				username = username.trim()
			} else if (!isNaN(username)) {
				username = util.fixPhoneNumber(username)
			} else {
				return reject('username error')
			}
			if (!authCode) return reject(`autCode required`)
			let filter = { passive: false, authCode: authCode, username: username }
			const docs = await db.authCodes.find(filter).sort({ _id: -1 }).limit(1)
			if (docs.length == 0) return reject('verification failed. authCodeDoc not found')
			let authCodeDoc = docs[0]
			if (authCodeDoc.authCodeExpire.getTime() < new Date().getTime()) return reject('authCode expired')
			if (authCodeDoc.verified) return reject('authCode has already been verified')

			let orgDoc = null
			let memberDoc = null
			if (authCodeDoc.organization) {
				orgDoc = await db.organizations.findOne({ _id: authCodeDoc.organization })
				if (!orgDoc) return reject(`organization not found`)
				memberDoc = await db.members.findOne({ username: username, organization: orgDoc._id })
				if (!memberDoc) return reject('member not found')
			} else {
				memberDoc = await db.members.findOne({ username: username, organization: null })
				if (!memberDoc) return reject('member not found')
				if (!['sysadmin', 'sysuser'].includes(memberDoc.role)) return reject(`permission denied`)
			}




			saveSession(orgDoc, memberDoc, req, 'dinamikup', null)
				.then(async result => {
					authCodeDoc.verified = true
					authCodeDoc.verifiedDate = new Date()
					authCodeDoc = await authCodeDoc.save()
					resolve(result)
				})
				.catch(reject)

		} catch (err) {
			console.log('err:', err)
			reject(err)
		}
	})
