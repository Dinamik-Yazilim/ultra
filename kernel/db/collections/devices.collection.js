const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      customer: { type: ObjectId, ref: 'customers', index: true },
      name: { type: String, required: true, index: true },
      appType: { type: String, required: true, enum: ['mikrov16', 'mikrov16', 'eta8', 'logogo', 'logotiger'] },
      mikro: {
        firmaNo: { type: Number, default: 0 },
        subeNo: { type: Number, default: 0 },
        depoNo: { type: Number, default: 1 },
        iadeDepoNo: { type: Number, default: 1 },
        sorumlulukMerkezi: { type: String, default: '' },
        projeKodu: { type: String, default: '' },
        nakitKasa: { type: String, default: '' },
        banka: { type: String, default: '' },
        cekKasasi: { type: String, default: '' },
        senetKasasi: { type: String, default: '' },
        sipSeri: [{
          sip_tip: { type: Number, required: true },
          sip_cins: { type: Number, required: true },
          sip_evrakno_seri: { type: String, default: '' },
        }],
        sthSeri: [{
          sth_evraktip: { type: Number, required: true },
          sth_evrakno_seri: { type: String, default: '' },
        }],
        chaSeri: [{
          cha_evrak_tip: { type: Number, required: true },
          cha_evrakno_seri: { type: String, default: '' },
        }],
        sckRefNo: [{
          sck_tip: { type: Number, required: true },
          sck_refno: { type: String, default: '' },
        }],
        ssip_evrakno_seri: { type: String, default: '' },

      },
      logo: {

      },
      passive: { type: Boolean, default: false, index: true }
    },
    { versionKey: false, timestamps: true }
  )

  schema.pre('save', async function (next) {
    const doc = this
    doc.fullName = (doc.firstName || '') + ' ' + (doc.lastName || '')
    next()
  })
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)

  let model = dbModel.conn.model(collectionName, schema, collectionName)

  model.removeOne = (member, filter) => sendToTrash(dbModel, collectionName, member, filter)
  return model
}
