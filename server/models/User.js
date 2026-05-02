import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  number: { type: String, required: true },
  typeName: { type: String, required: true },
}, { _id: true });

const depositSchema = new mongoose.Schema({
  name: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
}, { _id: true });

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  name: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString() },
}, { _id: true });

const cryptoWalletSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  rate: { type: Number, required: true },
  address: { type: String, required: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  pin: { type: String, default: null },
  name: { type: String, default: 'New Client' },
  internalBalance: { type: Number, default: 0 },
  cards: [cardSchema],
  deposits: [depositSchema],
  transactions: [transactionSchema],
  cryptoWallets: {
    BTC: cryptoWalletSchema,
    ETH: cryptoWalletSchema,
    SOL: cryptoWalletSchema,
    BNB: cryptoWalletSchema,
    ADA: cryptoWalletSchema,
  },
  isSeeded: { type: Boolean, default: false }, // Marks pre-seeded test accounts
}, { timestamps: true });

export default mongoose.model('User', userSchema);
