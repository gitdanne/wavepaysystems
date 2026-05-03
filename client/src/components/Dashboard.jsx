import { useContext, useState } from 'react';
import { BankContext } from '../state/BankContext';

const QuickAction = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', flex: 1 }}>
    <div style={{ width: 48, height: 48, borderRadius: '16px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}>
      {icon}
    </div>
    <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
  </button>
);

const TxIcon = ({ type }) => {
  if (type === 'income') return (
    <div style={{ width: 36, height: 36, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
    </div>
  );
  return (
    <div style={{ width: 36, height: 36, borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
    </div>
  );
};

export default function Dashboard({ navigateTo }) {
  const { currentUser, fiatCurrency, logout, topUpBalance, addCard } = useContext(BankContext);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpCardIndex, setTopUpCardIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [showNewCard, setShowNewCard] = useState(false);
  const [cardSuccess, setCardSuccess] = useState(null);
  const [showGuideTransition, setShowGuideTransition] = useState(false);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: fiatCurrency }).format(amount);
  };

  const handleTopUp = () => {
    const val = parseFloat(topUpAmount);
    if (isNaN(val) || val <= 0) return;
    topUpBalance(val, topUpCardIndex);
    setTopUpAmount('');
    setShowTopUp(false);
  };

  const notifications = [
    { id: 1, text: 'Ваша карта WavePay активна и готова к использованию', time: 'Сегодня', read: false },
    { id: 2, text: 'Добро пожаловать в WavePay! Ваш аккаунт создан', time: 'Сегодня', read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="h2 text-gradient">WavePay</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Добро пожаловать, {currentUser.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Notifications */}
          <button 
            onClick={() => setShowNotifications(p => !p)}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--danger-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white', border: '2px solid var(--bg-dark)' }}>
                {unreadCount}
              </div>
            )}
          </button>
          {/* Profile */}
          <button 
            onClick={() => navigateTo('profile')}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
        </div>
      </header>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="glass-panel" style={{ animation: 'slideDown 0.25s ease-out' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Уведомления</h4>
          {notifications.map(n => (
            <div key={n.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-glass)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : 'var(--accent-color)', marginTop: '6px', flexShrink: 0 }}></div>
              <div>
                <p style={{ fontSize: '13px', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.text}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Balance Card */}
      <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(0,0,0,0))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Текущий счет</p>
          <button 
            onClick={() => setBalanceHidden(p => !p)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {balanceHidden ? (
                <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>
              ) : (
                <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path><line x1="1" y1="1" x2="23" y2="23"></line></>
              )}
            </svg>
          </button>
        </div>
        <h1 className="h1">{balanceHidden ? '• • • • • •' : formatMoney(currentUser.internalBalance)}</h1>
        <p style={{ color: 'var(--success-color)', fontSize: '12px', marginTop: '8px' }}>
          Доступно • Wave Environment
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <QuickAction 
          label="Пополнить" 
          color="var(--success-color)" 
          onClick={() => setShowTopUp(true)}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
        />
        <QuickAction 
          label="Перевести" 
          color="var(--accent-color)" 
          onClick={() => navigateTo('transfers')}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>}
        />
        <QuickAction 
          label="Оплатить" 
          color="#a855f7" 
          onClick={() => alert('Оплата услуг — скоро!')}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>}
        />
        <QuickAction 
          label="Ещё" 
          color="var(--text-secondary)" 
          onClick={() => alert('Другие операции — скоро!')}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>}
        />
      </div>

      {/* Open New Card Button */}
      <div 
        onClick={() => setShowNewCard(true)}
        className="glass-panel" 
        style={{ 
          padding: '16px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(14, 165, 233, 0.08))',
          border: '1px solid rgba(168, 85, 247, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 42, height: 42, borderRadius: '14px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(14, 165, 233, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '15px' }}>Открыть новую карту</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>General, Crypto, Мультивалютная...</p>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>

      {/* New Card Modal */}
      {showNewCard && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowNewCard(false); setCardSuccess(null); } }}
        >
          <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-dark)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s ease-out', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px' }}></div>
            
            {cardSuccess ? (
              /* Success state */
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Карта открыта!</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>{cardSuccess.name}</p>
                
                {/* Mini card preview */}
                <div style={{ 
                  width: '260px', margin: '0 auto 24px', padding: '20px', borderRadius: '16px', 
                  background: cardSuccess.gradient,
                  boxShadow: cardSuccess.shadow,
                  textAlign: 'left',
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8, marginBottom: '16px', letterSpacing: '1px' }}>WAVEPAY</p>
                  <p style={{ fontSize: '16px', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '16px' }}>{cardSuccess.number}</p>
                  <p style={{ fontSize: '10px', opacity: 0.7 }}>{cardSuccess.typeName}</p>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={() => { setShowNewCard(false); setCardSuccess(null); navigateTo('cards'); }}>
                  Перейти к картам
                </button>
                <button className="btn" style={{ width: '100%', marginTop: '8px', padding: '14px' }} onClick={() => { setShowNewCard(false); setCardSuccess(null); }}>
                  Остаться на главной
                </button>
              </div>
            ) : (
              /* Card selection */
              <>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Открыть карту</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Выберите тип карты для выпуска</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(() => {
                    const hasGeneral = currentUser.cards.some(c => c.name === 'WavePay General');
                    const hasCrypto = currentUser.cards.some(c => c.name === 'WavePay Crypto');
                    const hasFreelance = currentUser.cards.some(c => c.name === 'WavePay Самозанятые');
                    const hasMulticurrency = currentUser.cards.some(c => c.name === 'WavePay Мультивалютная');

                    return (
                      <>
                        {/* WavePay General */}
                  <div 
                    onClick={() => {
                      if (hasGeneral) return;
                      const card = addCard('visa', 'WavePay General', 'Visa');
                      if (card) {
                        setShowGuideTransition(true);
                        setTimeout(() => {
                          setShowNewCard(false);
                          setShowGuideTransition(false);
                          navigateTo('transfers', { showGuide: true });
                        }, 2500);
                      }
                    }}
                    style={{ cursor: hasGeneral ? 'default' : 'pointer', borderRadius: '20px', overflow: 'hidden', transition: 'transform 0.2s', opacity: hasGeneral ? 0.6 : 1 }}
                    onMouseEnter={e => { if(!hasGeneral) e.currentTarget.style.transform = 'scale(1.02)' }}
                    onMouseLeave={e => { if(!hasGeneral) e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0284c7, #0ea5e9, #38bdf8)', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                      <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, letterSpacing: '2px', marginBottom: '4px' }}>WAVEPAY</p>
                          <h4 style={{ fontSize: '18px', fontWeight: 700 }}>General</h4>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px' }}>Visa</span>
                      </div>
                      <p style={{ fontSize: '12px', opacity: 0.8, lineHeight: 1.5 }}>Основная дебетовая карта для повседневных покупок и переводов</p>
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>Бесплатное обслуживание</span>
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{hasGeneral ? 'Открыта ✓' : 'Открыть →'}</span>
                      </div>
                    </div>
                  </div>

                  {/* WavePay Crypto */}
                  <div 
                    onClick={() => {
                      if (hasCrypto) return;
                      const card = addCard('mastercard', 'WavePay Crypto', 'Mastercard');
                      if (card) setCardSuccess({ ...card, gradient: 'linear-gradient(135deg, #1e1e2e, #2d1b69, #4c1d95)', shadow: '0 8px 24px rgba(76, 29, 149, 0.3)' });
                    }}
                    style={{ cursor: hasCrypto ? 'default' : 'pointer', borderRadius: '20px', overflow: 'hidden', transition: 'transform 0.2s', opacity: hasCrypto ? 0.6 : 1 }}
                    onMouseEnter={e => { if(!hasCrypto) e.currentTarget.style.transform = 'scale(1.02)' }}
                    onMouseLeave={e => { if(!hasCrypto) e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e1e2e, #2d1b69, #4c1d95)', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(168, 85, 247, 0.15)' }}></div>
                      <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(168, 85, 247, 0.08)' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, letterSpacing: '2px', marginBottom: '4px' }}>WAVEPAY</p>
                          <h4 style={{ fontSize: '18px', fontWeight: 700 }}>Crypto</h4>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(168, 85, 247, 0.3)', padding: '4px 10px', borderRadius: '8px' }}>Mastercard</span>
                      </div>
                      <p style={{ fontSize: '12px', opacity: 0.8, lineHeight: 1.5 }}>Карта для крипто-операций, кешбэк в BTC и мгновенные конвертации</p>
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>Кешбэк 1.5% в BTC</span>
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{hasCrypto ? 'Открыта ✓' : 'Открыть →'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Самозанятые */}
                  <div 
                    onClick={() => {
                      if (hasFreelance) return;
                      const card = addCard('visa', 'WavePay Самозанятые', 'Visa');
                      if (card) setCardSuccess({ ...card, gradient: 'linear-gradient(135deg, #065f46, #047857, #10b981)', shadow: '0 8px 24px rgba(16, 185, 129, 0.3)' });
                    }}
                    style={{ cursor: hasFreelance ? 'default' : 'pointer', borderRadius: '20px', overflow: 'hidden', transition: 'transform 0.2s', opacity: hasFreelance ? 0.6 : 1 }}
                    onMouseEnter={e => { if(!hasFreelance) e.currentTarget.style.transform = 'scale(1.02)' }}
                    onMouseLeave={e => { if(!hasFreelance) e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #065f46, #047857, #10b981)', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                      <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, letterSpacing: '2px', marginBottom: '4px' }}>WAVEPAY</p>
                          <h4 style={{ fontSize: '18px', fontWeight: 700 }}>Самозанятые</h4>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px' }}>Visa</span>
                      </div>
                      <p style={{ fontSize: '12px', opacity: 0.8, lineHeight: 1.5 }}>Для фрилансеров и ИП — учёт доходов, автоналоги и бизнес-аналитика</p>
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>Автоматический расчёт налогов</span>
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{hasFreelance ? 'Открыта ✓' : 'Открыть →'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Мультивалютная */}
                  <div 
                    onClick={() => {
                      if (hasMulticurrency) return;
                      const card = addCard('mastercard', 'WavePay Мультивалютная', 'Mastercard');
                      if (card) setCardSuccess({ ...card, gradient: 'linear-gradient(135deg, #4c1d95, #7e22ce, #a855f7)', shadow: '0 8px 24px rgba(168, 85, 247, 0.3)' });
                    }}
                    style={{ cursor: hasMulticurrency ? 'default' : 'pointer', borderRadius: '20px', overflow: 'hidden', transition: 'transform 0.2s', opacity: hasMulticurrency ? 0.6 : 1 }}
                    onMouseEnter={e => { if(!hasMulticurrency) e.currentTarget.style.transform = 'scale(1.02)' }}
                    onMouseLeave={e => { if(!hasMulticurrency) e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #4c1d95, #7e22ce, #a855f7)', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                      <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, letterSpacing: '2px', marginBottom: '4px' }}>WAVEPAY</p>
                          <h4 style={{ fontSize: '18px', fontWeight: 700 }}>Мультивалютная</h4>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px' }}>Mastercard</span>
                      </div>
                      <p style={{ fontSize: '12px', opacity: 0.8, lineHeight: 1.5 }}>12 валют на одной карте. Идеально для путешествий и оплат за рубежом</p>
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>Бесплатные конвертации</span>
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{hasMulticurrency ? 'Открыта ✓' : 'Открыть →'}</span>
                      </div>
                    </div>
                  </div>
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {showTopUp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }} onClick={(e) => { if (e.target === e.currentTarget) setShowTopUp(false); }}>
          <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-dark)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 24px' }}></div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Пополнение карты</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Выберите карту и введите сумму</p>
            
            <select 
              value={topUpCardIndex} 
              onChange={e => setTopUpCardIndex(Number(e.target.value))}
              className="input-field"
              style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', padding: '12px' }}
            >
              {currentUser.cards.map((c, i) => (
                <option key={i} value={i} style={{ color: 'black' }}>
                  {c.name} (•••• {c.number.slice(-4)}) — {formatMoney(c.balance)}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[5000, 10000, 50000, 100000].map(preset => (
                <button 
                  key={preset} 
                  className="btn" 
                  style={{ flex: 1, padding: '10px 4px', fontSize: '12px', borderRadius: '12px' }}
                  onClick={() => setTopUpAmount(String(preset))}
                >
                  {preset >= 1000 ? `${preset/1000}K` : preset}
                </button>
              ))}
            </div>

            <input 
              type="number" 
              className="input-field" 
              placeholder="Сумма" 
              value={topUpAmount} 
              onChange={(e) => setTopUpAmount(e.target.value)}
              style={{ marginBottom: '16px', fontSize: '20px', textAlign: 'center', fontWeight: 600 }}
            />

            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }} onClick={handleTopUp}>
              Пополнить {topUpAmount && formatMoney(parseFloat(topUpAmount) || 0)}
            </button>
          </div>
        </div>
      )}

      {/* Transaction History Button */}
      <div 
        onClick={() => setShowHistory(p => !p)}
        className="glass-panel" 
        style={{ 
          padding: '16px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: showHistory ? '1px solid var(--accent-color)' : '1px solid var(--border-glass)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 42, height: 42, borderRadius: '14px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '15px' }}>История операций</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {currentUser.transactions.length === 0 
                ? 'Нет операций' 
                : `${currentUser.transactions.length} операци${currentUser.transactions.length === 1 ? 'я' : currentUser.transactions.length < 5 ? 'и' : 'й'}`
              }
            </p>
          </div>
        </div>
        <svg 
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.3s ease', transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {/* Transaction History List */}
      {showHistory && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'slideDown 0.25s ease-out' }}>
          {currentUser.transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Операций пока нет</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>Пополните счёт, чтобы начать</p>
            </div>
          )}
          {currentUser.transactions.map(tx => (
            <div 
              key={tx.id} 
              className="glass-panel" 
              style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onClick={() => setSelectedTx(tx)}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
            >
              <TxIcon type={tx.type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString('ru-RU')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: tx.type === 'income' ? 'var(--success-color)' : 'var(--text-primary)', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedTx(null); }}
        >
          <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-dark)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px' }}></div>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: '50%', 
                background: selectedTx.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' 
              }}>
                <TxIcon type={selectedTx.type} />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {selectedTx.type === 'income' ? 'Поступление' : 'Списание'}
              </p>
              <h2 style={{ 
                fontSize: '32px', fontWeight: 700, 
                color: selectedTx.type === 'income' ? 'var(--success-color)' : 'var(--text-primary)' 
              }}>
                {selectedTx.type === 'income' ? '+' : '-'}{formatMoney(selectedTx.amount)}
              </h2>
            </div>

            {/* Details */}
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Операция</span>
                <span style={{ fontSize: '13px', fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{selectedTx.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Дата</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                  {new Date(selectedTx.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Время</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                  {new Date(selectedTx.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Статус</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Выполнено
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>ID транзакции</span>
                <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                  #{String(selectedTx.id).slice(-8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn" 
                style={{ flex: 1, padding: '14px', fontSize: '14px', borderRadius: '14px' }}
                onClick={() => {
                  const receipt = [
                    '══════════════════════════',
                    '         ЧЕК WAVEPAY         ',
                    '══════════════════════════',
                    '',
                    `Операция: ${selectedTx.name}`,
                    `Тип: ${selectedTx.type === 'income' ? 'Поступление' : 'Списание'}`,
                    `Сумма: ${selectedTx.type === 'income' ? '+' : '-'}${selectedTx.amount} ${fiatCurrency}`,
                    `Дата: ${new Date(selectedTx.date).toLocaleDateString('ru-RU')}`,
                    `Время: ${new Date(selectedTx.date).toLocaleTimeString('ru-RU')}`,
                    `Статус: Выполнено ✓`,
                    `ID: #${String(selectedTx.id).slice(-8).toUpperCase()}`,
                    '',
                    '──────────────────────────',
                    '        WavePay Bank',
                    '   Ваш финансовый океан 🌊',
                    '══════════════════════════',
                  ].join('\n');
                  
                  const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `wavepay_receipt_${String(selectedTx.id).slice(-8)}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Скачать чек
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, padding: '14px', fontSize: '14px', borderRadius: '14px' }}
                onClick={() => {
                  const text = `WavePay чек: ${selectedTx.name} | ${selectedTx.type === 'income' ? '+' : '-'}${selectedTx.amount} ${fiatCurrency} | ${new Date(selectedTx.date).toLocaleString('ru-RU')} | ID #${String(selectedTx.id).slice(-8).toUpperCase()}`;
                  if (navigator.share) {
                    navigator.share({ title: 'Чек WavePay', text });
                  } else {
                    navigator.clipboard.writeText(text);
                    alert('Чек скопирован в буфер обмена');
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                Поделиться
              </button>
            </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '10px', padding: '14px', fontSize: '15px' }}
                onClick={() => setSelectedTx(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        {/* Guide Animation Overlay */}
        {showGuideTransition && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInOut 2.5s ease-in-out forwards' }}>
            <div style={{ animation: 'cardReveal 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', transform: 'scale(0.8)', opacity: 0 }}>
              <div style={{ width: 320, height: 200, background: 'linear-gradient(135deg, #0284c7, #0ea5e9, #38bdf8)', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 40px rgba(14, 165, 233, 0.4)' }}>
                 <h3 style={{color:'white', fontSize:'24px', fontWeight:700, letterSpacing:'2px'}}>WAVEPAY</h3>
                 <div style={{marginTop:'20px', display:'flex', justifyContent:'center'}}>
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 </div>
                 <p style={{color:'white', textAlign:'center', marginTop:'20px', fontSize:'18px', fontWeight:600}}>Карта выпущена!</p>
              </div>
            </div>
            <style>
              {`
                @keyframes cardReveal {
                  0% { transform: scale(0.5) translateY(100px); opacity: 0; }
                  20% { transform: scale(1.05) translateY(0); opacity: 1; }
                  70% { transform: scale(1) translateY(0); opacity: 1; }
                  100% { transform: scale(1.5) translateY(-500px); opacity: 0; filter: blur(10px); }
                }
                @keyframes fadeInOut {
                  0% { opacity: 0; background: rgba(0,0,0,0); }
                  10% { opacity: 1; background: var(--bg-dark); }
                  90% { opacity: 1; background: var(--bg-dark); }
                  100% { opacity: 1; background: var(--bg-dark); }
                }
              `}
            </style>
          </div>
        )}
      </div>
    );
  }
