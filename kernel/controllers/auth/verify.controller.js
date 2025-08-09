const { saveSession } = require('./helper')

module.exports = (req) =>
	new Promise(async (resolve, reject) => {
		try {
			if (!req.method == 'POST') return restError.method(req, reject)
			let authCode = req.getValue('authCode')
			console.log('authCode:', authCode)
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

			let partnerDoc = null
			let orgDoc = null
			let memberDoc = await db.members.findOne({ username: username, partner: authCodeDoc.partner, organization: authCodeDoc.organization })
			if (!memberDoc) return reject(`login failed. member not found.`)
			if (!memberDoc.organization && !memberDoc.partner && !memberDoc.role.startsWith('sys'))
				return reject(`permission denied`)

			if (!memberDoc.organization && memberDoc.partner && !memberDoc.role.startsWith('partner'))
				return reject(`permission denied`)

			if (memberDoc.partner) {
				partnerDoc = await db.partners.findOne({ _id: memberDoc.partner })
				if (!partnerDoc) return reject(`partner not found`)
			}

			if (memberDoc.organization) {
				orgDoc = await db.organizations.findOne({ _id: memberDoc.organization })
				if (!orgDoc) return reject(`organization not found`)
			}

			saveSession(partnerDoc, orgDoc, memberDoc, req, 'dinamikup', null)
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
