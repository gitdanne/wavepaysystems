import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const INITIAL_DB = [
  {
    phone: '+78881234567',
    password: 'test',
    pin: '1234',
    name: 'Еркебулан Дастанович',
    internalBalance: 50000,
    deposits: [],
    transactions: [],
    cryptoWallets: {
      BTC: { balance: 0, rate: 68000, address: 'bc1q_test' },
      ETH: { balance: 0, rate: 3500, address: '0x_test' },
      SOL: { balance: 0, rate: 150, address: 'sol_test' },
      BNB: { balance: 0, rate: 600, address: 'bnb_test' },
      ADA: { balance: 0, rate: 0.8, address: 'ada_test' },
    },
    cards: [
      { type: 'visa', name: 'WavePay Electronic', number: '1234 5678 9012 3456', typeName: 'Visa' }
    ]
  },
  {
    phone: '+77011112233',
    password: 'password123',
    pin: '1111',
    name: 'Алихан Серикович',
    internalBalance: 250000,
    deposits: [],
    transactions: [],
    cryptoWallets: {
      BTC: { balance: 0, rate: 68000, address: 'bc1q_a1' },
      ETH: { balance: 0, rate: 3500, address: '0x_a1' },
      SOL: { balance: 0, rate: 150, address: 'sol_a1' },
      BNB: { balance: 0, rate: 600, address: 'bnb_a1' },
      ADA: { balance: 0, rate: 0.8, address: 'ada_a1' },
    },
    cards: [
      { type: 'visa', name: 'WavePay Electronic', number: '4400 1111 2222 3333', typeName: 'Visa' }
    ]
  },
  {
    phone: '+77025556677',
    password: 'qwerty99',
    pin: '2222',
    name: 'Мадина Ахметова',
    internalBalance: 75000,
    deposits: [],
    transactions: [],
    cryptoWallets: {
      BTC: { balance: 0, rate: 68000, address: 'bc1q_m2' },
      ETH: { balance: 0, rate: 3500, address: '0x_m2' },
      SOL: { balance: 0, rate: 150, address: 'sol_m2' },
      BNB: { balance: 0, rate: 600, address: 'bnb_m2' },
      ADA: { balance: 0, rate: 0.8, address: 'ada_m2' },
    },
    cards: [
      { type: 'visa', name: 'WavePay Electronic', number: '4400 5555 6666 7777', typeName: 'Visa' }
    ]
  },
  {
    phone: '+77778889900',
    password: 'secure456',
    pin: '0000',
    name: 'Данияр Жумабаев',
    internalBalance: 120000,
    deposits: [],
    transactions: [],
    cryptoWallets: {
      BTC: { balance: 0, rate: 68000, address: 'bc1q_d3' },
      ETH: { balance: 0, rate: 3500, address: '0x_d3' },
      SOL: { balance: 0, rate: 150, address: 'sol_d3' },
      BNB: { balance: 0, rate: 600, address: 'bnb_d3' },
      ADA: { balance: 0, rate: 0.8, address: 'ada_d3' },
    },
    cards: [
      { type: 'visa', name: 'WavePay Electronic', number: '4400 8888 9999 0000', typeName: 'Visa' }
    ]
  },
  {
    phone: '+77770000000',
    password: 'wave1234',
    pin: null,
    name: 'Old User',
    internalBalance: 150000,
    deposits: [{ name: 'На машину', target: 500000, current: 120000 }],
    transactions: [
      { type: 'income', amount: 50000, name: 'Пополнение с карты', date: '2026-04-09T12:00:00Z' }
    ],
    cryptoWallets: {
      BTC: { balance: 0.05, rate: 68000, address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
      ETH: { balance: 1.2, rate: 3500, address: '0x71C...3a4B' },
      SOL: { balance: 15.5, rate: 150, address: '7gR9...Zp2W' },
      BNB: { balance: 4.0, rate: 600, address: 'bnb1...9skt' },
      ADA: { balance: 500.0, rate: 0.8, address: 'addr1...2p9x' },
    },
    cards: [
      { type: 'visa', name: 'WavePay Electronic', number: '4400 1122 3344 5566', typeName: 'Visa' },
      { type: 'mastercard', name: 'WavePay Crypto Card', number: '5500 9988 7766 5544', typeName: 'Mastercard' }
    ]
  }
];

async function seedDatabase() {
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI не задан. Пропуск инициализации БД.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключено к MongoDB');

    for (const userData of INITIAL_DB) {
      const existing = await User.findOne({ phone: userData.phone });
      if (!existing) {
        console.log(`Создание мок-аккаунта: ${userData.name} (${userData.phone})`);
        const passwordHash = await bcrypt.hash(userData.password, 10);
        await User.create({ ...userData, passwordHash, isSeeded: true });
      }
    }

    console.log('✅ Инициализация БД завершена');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка при инициализации БД:', err);
    process.exit(1);
  }
}

seedDatabase();
