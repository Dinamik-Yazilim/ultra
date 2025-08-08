const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      organization: { type: ObjectId, ref: 'organizations', index: true },
      db: { type: String, required: true, index: true },
      name: { type: String, required: true, index: true },
      warehouseId: { type: String, default: '', index: true },
      warehouse: { type: String, default: '' },
      responsibilityId: { type: String, default: '', index: true },
      responsibility: { type: String, default: '', index: true },
      projectId: { type: String, default: '', index: true },
      project: { type: String, default: '', index: true },
      defaultFirmId: { type: String, default: '', index: true },
      defaultFirm: { type: String, default: '', index: true },
      posIntegration: {
        integrationType: { type: String, enum: ['dinamikup', 'pos312', 'ingenico', 'genius3'], index: true },
        useMikroWorkData: { type: Boolean, default: true, index: true },
        pos312: {
          webServiceUrl: { type: String, default: '' },
          webServiceUsername: { type: String, default: '' },
          webServicePassword: { type: String, default: '' },
          storeId: { type: Number, default: 0, index: true },
        },
        ingenico: {
          webServiceUrl: { type: String, default: '' },
          webServiceUsername: { type: String, default: '' },
          webServicePassword: { type: String, default: '' },
        },
        genius3: {

        },
        lastUpdate_items: { type: String, default: '', index: true },
        lastUpdate_barcodes: { type: String, default: '', index: true },
        lastUpdate_firms: { type: String, default: '', index: true },
        lastUpdate_prices: { type: String, default: '', index: true },
      },
      passive: { type: Boolean, default: false, index: true }
    },
    { versionKey: false, timestamps: true }
  )

  schema.pre('save', (next) => next())
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)

  let model = dbModel.conn.model(collectionName, schema, collectionName)

  model.removeOne = (member, filter) => sendToTrash(dbModel, collectionName, member, filter)
  return model
}
