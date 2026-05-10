import { createContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

export const BankContext = createContext();

const TOKEN_KEY = 'wavecoin_token';
const API_BASE_URL = 'https://WaveCoin-backend.onrender.com';

// Coin metadata for the UI
export const COIN_META = {
  BTC: { name: 'Bitcoin', icon: '₿', color: '#f7931a', symbol: 'BTC' },
  ETH: { name: 'Ethereum', icon: 'Ξ', color: '#627eea', symbol: 'ETH' },
  SOL: { name: 'Solana', icon: '◎', color: '#9945ff', symbol: 'SOL' },
  BNB: { name: 'BNB', icon: '◆', color: '#f3ba2f', symbol: 'BNB' },
  ADA: { name: 'Cardano', icon: '₳', color: '#0033ad', symbol: 'ADA' },
};

export const BankProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [activePhone, setActivePhone] = useState(null);
  const [fiatCurrency] = useState('wcT');
  const [fiatRateToUsd] = useState(1); // 1 wcT = 1 USD equivalent for display
  const [socket, setSocket] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        setActivePhone(data.phone);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      fetchProfile();

      // Initialize Socket connection
      const newSocket = io(API_BASE_URL, {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
      });

      newSocket.on('balance_update', (data) => {
        console.log('💰 Real-time balance update received:', data);
        fetchProfile(); // Refresh profile to get new balance and transactions
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
      };
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setCurrentUser(null);
      setActivePhone(null);
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [token, fetchProfile]);

  const apiCall = async (url, method, body) => {
    try {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
      const res = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        // Optimistically refresh profile to get updated balances/transactions
        await fetchProfile();
        return { success: true, ...data };
      }
      return { success: false, error: data.error };
    } catch (err) {
      console.error(`API Error on ${method} ${url}:`, err);
      return { success: false, error: 'Network error' };
    }
  };

  const login = async (phone, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (phone, password, iin, name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, iin, name })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Register error:', err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
  };

  const createDeposit = async (name, target) => {
    const res = await apiCall('/api/deposits/create', 'POST', { name, target });
    return res.success;
  };

  const transferToDeposit = async (id, amount) => {
    const res = await apiCall('/api/deposits/topup', 'POST', { id, amount });
    return res.success;
  };

  const withdrawFromDeposit = async (id) => {
    const res = await apiCall('/api/deposits/withdraw', 'POST', { id });
    return res.success;
  };

  const findRecipient = async (query) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/transfers/find?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.found) {
        return { name: data.name };
      }
      return null;
    } catch (err) {
      console.error('Find recipient error:', err);
      return null;
    }
  };

  const internalTransfer = async (toIdentifier, amount, fromCardIndex) => {
    const res = await apiCall('/api/transfers/internal', 'POST', { identifier: toIdentifier, amount, fromCardIndex });
    return res.success;
  };

  const externalTransfer = async (cardNumber, amount, fromCardIndex) => {
    const res = await apiCall('/api/transfers/external', 'POST', { cardNumber, amount, fromCardIndex });
    return res.success;
  };

  const ownTransfer = async (fromCardIndex, toCardIndex, amount) => {
    const res = await apiCall('/api/transfers/own', 'POST', { fromCardIndex, toCardIndex, amount });
    return res.success;
  };

  const buyCrypto = async (coin, coinAmount) => {
    const res = await apiCall('/api/crypto/buy', 'POST', { coin, coinAmount });
    return res.success;
  };

  const sellCrypto = async (coin, coinAmount) => {
    const res = await apiCall('/api/crypto/sell', 'POST', { coin, coinAmount });
    return res.success;
  };

  const swapCrypto = async (fromCoin, toCoin, fromAmount) => {
    // Swap is buy toCoin with the fiat equivalent of selling fromCoin
    const sellRes = await apiCall('/api/crypto/sell', 'POST', { coin: fromCoin, coinAmount: fromAmount });
    if (!sellRes.success) return false;
    // Now buy the toCoin with the equivalent fiat
    const fromWallet = currentUser.cryptoWallets[fromCoin];
    const toWallet = currentUser.cryptoWallets[toCoin];
    const fiatValue = fromAmount * fromWallet.rate;
    const toCoinAmount = fiatValue / toWallet.rate;
    const buyRes = await apiCall('/api/crypto/buy', 'POST', { coin: toCoin, coinAmount: toCoinAmount * 0.997 }); // 0.3% fee
    return buyRes.success;
  };

  const topUpBalance = async (amount, cardIndex) => {
    const res = await apiCall('/api/user/topup', 'POST', { amount, cardIndex });
    return res.success;
  };


  const getUserPin = () => {
    return currentUser ? currentUser.pin : null;
  };

  const setUserPin = async (pin) => {
    const res = await apiCall('/api/auth/pin/set', 'POST', { pin });
    if (res.success) {
      setCurrentUser(prev => ({ ...prev, pin }));
    }
  };

  const verifyPin = async (pin) => {
    const res = await apiCall('/api/auth/pin/verify', 'POST', { pin });
    return res.success;
  };

  // Utility: calculate total portfolio value in wcT
  const getTotalPortfolioValue = () => {
    if (!currentUser) return 0;
    let total = currentUser.internalBalance || 0;
    if (currentUser.cryptoWallets) {
      Object.values(currentUser.cryptoWallets).forEach(w => {
        total += (w.balance || 0) * (w.rate || 0);
      });
    }
    return total;
  };

  return (
    <BankContext.Provider value={{
      currentUser,
      activePhone,
      fiatCurrency,
      fiatRateToUsd,
      login,
      register,
      logout,
      createDeposit,
      transferToDeposit,
      withdrawFromDeposit,
      internalTransfer,
      externalTransfer,
      ownTransfer,
      buyCrypto,
      sellCrypto,
      swapCrypto,
      findRecipient,
      topUpBalance,
      getUserPin,
      setUserPin,
      verifyPin,

      getTotalPortfolioValue,
    }}>
      {children}
    </BankContext.Provider>
  );
};
