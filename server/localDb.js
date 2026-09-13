const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'local_db.json');

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      settings: { key: 'global', maxParticipants: 50 },
      registrations: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readDb() {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[LocalDB] Read error, resetting:', err);
    return { settings: { key: 'global', maxParticipants: 50 }, registrations: [] };
  }
}

function writeDb(data) {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

class LocalRegistrationDoc {
  constructor(data) {
    Object.assign(this, data);
    if (typeof this.createdAt === 'string') {
      this.createdAt = new Date(this.createdAt);
    }
    if (typeof this.updatedAt === 'string') {
      this.updatedAt = new Date(this.updatedAt);
    }
  }

  async save() {
    const db = readDb();
    const index = db.registrations.findIndex((r) => r._id === this._id);
    this.updatedAt = new Date();
    const plain = {
      ...this,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
    if (index !== -1) {
      db.registrations[index] = plain;
    } else {
      db.registrations.push(plain);
    }
    writeDb(db);
    return this;
  }

  async deleteOne() {
    const db = readDb();
    db.registrations = db.registrations.filter((r) => r._id !== this._id);
    writeDb(db);
    return { acknowledged: true, deletedCount: 1 };
  }
}

class LocalSettingsDoc {
  constructor(data) {
    this.key = data.key || 'global';
    this.maxParticipants = Number(data.maxParticipants) || 50;
  }

  async save() {
    const db = readDb();
    db.settings = {
      key: this.key,
      maxParticipants: this.maxParticipants,
    };
    writeDb(db);
    return this;
  }
}

const LocalRegistration = {
  async countDocuments() {
    const db = readDb();
    return db.registrations.length;
  },

  async create(data) {
    const now = new Date();
    const docData = {
      _id: crypto.randomBytes(12).toString('hex'),
      fullname: data.fullname || '',
      regno: data.regno || '',
      mobile: data.mobile || '',
      email: data.email ? data.email.toLowerCase() : '',
      dept: data.dept || '',
      section: data.section || '',
      teamname: data.teamname || '',
      participantCount: Number(data.participantCount) || 3,
      memberDetails: Array.isArray(data.memberDetails) ? data.memberDetails : [],
      createdAt: now,
      updatedAt: now,
    };
    const doc = new LocalRegistrationDoc(docData);
    await doc.save();
    return doc;
  },

  find() {
    return {
      async sort(sortObj = { createdAt: -1 }) {
        const db = readDb();
        const docs = db.registrations.map((r) => new LocalRegistrationDoc(r));
        if (sortObj.createdAt === -1) {
          docs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } else if (sortObj.createdAt === 1) {
          docs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        }
        return docs;
      },
    };
  },

  async findById(id) {
    const db = readDb();
    const raw = db.registrations.find((r) => r._id === id);
    if (!raw) return null;
    return new LocalRegistrationDoc(raw);
  },
};

const LocalSettings = {
  async getSettings() {
    const db = readDb();
    if (!db.settings) {
      db.settings = { key: 'global', maxParticipants: 50 };
      writeDb(db);
    }
    return new LocalSettingsDoc(db.settings);
  },
};

module.exports = {
  LocalRegistration,
  LocalSettings,
};
