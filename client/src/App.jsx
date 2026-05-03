import { useState, useContext, useCallback } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Cards from './components/Cards';
import PiggyBank from './components/PiggyBank';
import CryptoWallet from './components/CryptoWallet';
import Transfers from './components/Transfers';
import Login from './components/Login';
import PinCode from './components/PinCode';
import Profile from './components/Profile';
import Payments from './components/Payments';
import { BankContext } from './state/BankContext';

function App() {
  const { currentUser, activePhone, logout, getUserPin, setUserPin, verifyPin } = useContext(BankContext);
  const [activeTab, setActiveTab] = useState('home');
  const [navParams, setNavParams] = useState({});
  const [pinState, setPinState] = useState('idle'); // idle | create | confirm | verify | done
  const [tempPin, setTempPin] = useState('');

  // After login, check if PIN exists
  const isPinRequired = currentUser && pinState !== 'done';

  // Determine PIN mode
  const getPinMode = useCallback(() => {
    if (!currentUser) return null;
    const existingPin = getUserPin();
    
    if (existingPin) {
      // PIN exists → need to verify
      if (pinState === 'idle' || pinState === 'verify') return 'verify';
    } else {
      // No PIN → create flow
      if (pinState === 'idle' || pinState === 'create') return 'create';
      if (pinState === 'confirm') return 'confirm';
    }
    return null;
  }, [currentUser, pinState, getUserPin]);

  const handlePinComplete = useCallback(async (enteredPin) => {
    const existingPin = getUserPin();
    
    if (!existingPin) {
      // Creating new PIN
      if (pinState === 'idle' || pinState === 'create') {
        setTempPin(enteredPin);
        setPinState('confirm');
        return true;
      }
      if (pinState === 'confirm') {
        if (enteredPin === tempPin) {
          await setUserPin(enteredPin);
          setPinState('done');
          setTempPin('');
          return true;
        }
        return false; // PINs don't match
      }
    } else {
      // Verifying existing PIN
      const isValid = await verifyPin(enteredPin);
      if (isValid) {
        setPinState('done');
        return true;
      }
      return false; // Wrong PIN
    }
  }, [pinState, tempPin, getUserPin, setUserPin, verifyPin]);

  const handlePinBack = useCallback(() => {
    if (pinState === 'confirm') {
      setPinState('create');
      setTempPin('');
    } else {
      // Logout completely
      setPinState('idle');
      setTempPin('');
      logout();
    }
  }, [pinState, logout]);

  // Reset pin state when user logs out
  if (!currentUser && pinState !== 'idle') {
    setPinState('idle');
    setTempPin('');
  }

  if (!currentUser) {
    return (
      <div className="mobile-container">
        <Login />
      </div>
    );
  }

  // Show PIN screen
  const pinMode = getPinMode();
  if (isPinRequired && pinMode) {
    return (
      <div className="mobile-container">
        <PinCode
          mode={pinMode}
          onComplete={handlePinComplete}
          onBack={handlePinBack}
        />
      </div>
    );
  }

  const navigateTo = (tab, params = {}) => {
    setNavParams(params);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard navigateTo={navigateTo} />;
      case 'cards': return <Cards navigateTo={navigateTo} />;
      case 'transfers': return <Transfers navigateTo={navigateTo} navParams={navParams} />;
      case 'piggy': return <PiggyBank />;
      case 'crypto': return <CryptoWallet />;
      case 'payments': return <Payments />;
      case 'profile': return <Profile />;
      default: return <Dashboard navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="mobile-container">
      <div className="app-content">
        {renderContent()}
      </div>

      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => navigateTo('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V14h6v7"/></svg>
          <span>Главная</span>
        </button>
        <button className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => navigateTo('cards')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
          <span>Карты</span>
        </button>
        <button className={`nav-item ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => navigateTo('transfers')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5l7 7-7 7"/><path d="M19 12H5"/></svg>
          <span>Переводы</span>
        </button>
        <button className={`nav-item ${activeTab === 'piggy' ? 'active' : ''}`} onClick={() => navigateTo('piggy')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5V2h-4l2 3"/><path d="M2 8a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4v5a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7V8z"/><path d="M2 13h2"/><circle cx="8" cy="9" r="1"/></svg>
          <span>Сбережения</span>
        </button>
        <button className={`nav-item ${activeTab === 'crypto' ? 'active' : ''}`} onClick={() => navigateTo('crypto')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M8 9h7a2 2 0 0 1 0 4H8"/><path d="M8 13h7.5a2 2 0 0 1 0 4H8"/></svg>
          <span>Крипто</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
