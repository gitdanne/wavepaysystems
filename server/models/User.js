import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  number: { type: String, required: true },
  typeName: { type: String, required: true },
  balance: { type: Number, default: 0 },
  isMulticurrency: { type: Boolean, default: false },
  defaultCrypto: { type: String, default: 'BTC' },
  balances: {
    type: Map,
    of: Number,
    default: {}
  }
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

const cashbackEntrySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString() },
}, { _id: true });

const creditSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  monthlyPayment: { type: Number, required: true },
  interestRate: { type: Number, default: 18 },
  term: { type: Number, required: true },
  status: { type: String, enum: ['active', 'paid'], default: 'active' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { _id: true });

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  iin: { type: String, default: '' },
  pin: { type: String, default: null },
  name: { type: String, default: 'New Client' },
  internalBalance: { type: Number, default: 0 },
  cashbackBalance: { type: Number, default: 0 },
  cashbackTotal: { type: Number, default: 0 },
  cashbackHistory: [cashbackEntrySchema],
  cards: [cardSchema],
  deposits: [depositSchema],
  credits: [creditSchema],
  transactions: [transactionSchema],
  cryptoWallets: {
    BTC: cryptoWalletSchema,
    ETH: cryptoWalletSchema,
    SOL: cryptoWalletSchema,
    BNB: cryptoWalletSchema,
    ADA: cryptoWalletSchema,
  },
  isSeeded: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
