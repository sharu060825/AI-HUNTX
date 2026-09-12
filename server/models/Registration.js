const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    regno: { type: String, required: true, trim: true },
    dept:  { type: String, required: true, trim: true },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    fullname:         { type: String, required: true, trim: true },
    regno:            { type: String, required: true, trim: true },
    mobile:           { type: String, required: true, trim: true },
    email:            { type: String, required: true, trim: true, lowercase: true },
    dept:             { type: String, required: true, trim: true },
    section:          { type: String, required: true, trim: true },
    teamname:         { type: String, required: true, trim: true },
    participantCount: { type: Number, required: true, min: 2, max: 5 },
    memberDetails:    { type: [memberSchema], default: [] },
  },
  { timestamps: true }
);

const MongooseRegistration = mongoose.model('Registration', registrationSchema);
const { isLocalMode } = require('../db');
const { LocalRegistration } = require('../localDb');

const RegistrationProxy = new Proxy(MongooseRegistration, {
  get(target, prop, receiver) {
    if (isLocalMode()) {
      if (prop in LocalRegistration) {
        return LocalRegistration[prop];
      }
    }
    return Reflect.get(target, prop, receiver);
  },
});

module.exports = RegistrationProxy;

