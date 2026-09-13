const mongoose = require('mongoose');

// Singleton document (key: 'global') so the admin can adjust the
// registration cap without a redeploy.
const settingsSchema = new mongoose.Schema({
  key:              { type: String, required: true, unique: true, default: 'global' },
  maxParticipants:  { type: Number, required: true, default: 50 },
});

settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: 'global' });
  if (!settings) settings = await this.create({ key: 'global', maxParticipants: 50 });
  return settings;
};

const MongooseSettings = mongoose.model('Settings', settingsSchema);
const { isLocalMode } = require('../db');
const { LocalSettings } = require('../localDb');

const SettingsProxy = new Proxy(MongooseSettings, {
  get(target, prop, receiver) {
    if (isLocalMode()) {
      if (prop in LocalSettings) {
        return LocalSettings[prop];
      }
    }
    return Reflect.get(target, prop, receiver);
  },
});

module.exports = SettingsProxy;

