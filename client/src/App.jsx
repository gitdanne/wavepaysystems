import { useState, useContext, useCallback } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Market from './components/Market';
import Swap from './components/Swap';
import Staking from './components/Staking';
import SendReceive from './components/SendReceive';
import Login from './components/Login';
import PinCode from './components/PinCode';
import Profile from './components/Profile';
import Lending from './components/Lending';
import Wallets from './components/Wallets';
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
      case 'market': return <Market navigateTo={navigateTo} />;
      case 'swap': return <Swap />;
      case 'transfers': return <SendReceive navigateTo={navigateTo} navParams={navParams} />;
      case 'staking': return <Staking />;
      case 'profile': return <Profile />;
      case 'lending': return <Lending navigateTo={navigateTo} />;
      case 'wallets': return <Wallets navigateTo={navigateTo} />;
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7l-9-4-9 4v5"/>
            <path d="M3 12l9 4 9-4"/>
            <path d="M12 22V16"/>
            <path d="M3 12v5l9 4 9-4v-5"/>
          </svg>
          <span>Портфель</span>
        </button>
        <button className={`nav-item ${activeTab === 'market' ? 'active' : ''}`} onClick={() => navigateTo('market')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>Рынок</span>
        </button>
        <button className={`nav-item ${activeTab === 'swap' ? 'active' : ''}`} onClick={() => navigateTo('swap')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 0L3 8m4-4l4 4"/>
            <path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
          <span>Обмен</span>
        </button>
        <button className={`nav-item ${activeTab === 'staking' ? 'active' : ''}`} onClick={() => navigateTo('staking')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span>Стейкинг</span>
        </button>
        <button className={`nav-item ${activeTab === 'wallets' ? 'active' : ''}`} onClick={() => navigateTo('wallets')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
            <path d="M16 14h.01"/>
          </svg>
          <span>Счета</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
