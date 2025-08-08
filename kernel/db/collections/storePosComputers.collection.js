const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      organization: { type: ObjectId, ref: 'organizations', index: true },
      db: { type: String, required: true, index: true },
      store: { type: ObjectId, ref: 'stores', index: true },
      name: { type: String, required: true, index: true },
      responsibilityId: { type: String, default: '', index: true },
      responsibility: { type: String, default: '', index: true },
      projectId: { type: String, default: '', index: true },
      project: { type: String, default: '', index: true },
      cashAccountId: { type: String, default: '', index: true },
      cashAccount: { type: String, default: '', index: true },
      bankAccountId: { type: String, default: '', index: true },
      bankAccount: { type: String, default: '', index: true },
      salesDocNoSerial: { type: String, default: '', index: true },
      integrationCode: { type: String, default: '', index: true },

      scale: {
        connectionType: { type: String, defaul: '' },
        comPortOptions: {}
      },
      paymentDevices: [],
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
