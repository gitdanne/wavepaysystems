import { useState, useContext } from 'react';
import { BankContext } from '../state/BankContext';

const maskCardNumber = (number) => {
  const parts = number.split(' ');
  if (parts.length >= 4) return `•••• ${parts[parts.length - 1]}`;
  return '•••• ••••';
};

export default function Transfers({ navParams }) {
  const { currentUser, fiatCurrency, internalTransfer, externalTransfer, findRecipient } = useContext(BankContext);
  const [selectedCard, setSelectedCard] = useState(navParams?.selectedCardIndex ?? 0);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [extCard, setExtCard] = useState('');
  const [extAmount, setExtAmount] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [activeSection, setActiveSection] = useState('internal');


  const recipient = phone.length >= 10 ? findRecipient(phone) : null;

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: fiatCurrency }).format(amount);
  };

  const handleTransfer = () => {
    const val = parseFloat(amount);
    if (!phone || phone.length < 10) { alert('Введите корректный номер телефона или карты'); return; }
    if (!recipient) { alert('Пользователь не найден в системе WavePay'); return; }
    if (isNaN(val) || val <= 0) { alert('Введите корректную сумму'); return; }

    const success = internalTransfer(phone, val);
    if (success) {
      setSuccessData({ amount: val, recipientName: recipient.name, cardUsed: currentUser.cards[selectedCard]?.number });
      setPhone(''); setAmount('');
    } else {
      alert('Недостаточно средств на счете');
    }
  };

  const handleExternalTransfer = () => {
    const val = parseFloat(extAmount);
    const cleanCard = extCard.replace(/\s+/g, '');
    if (!cleanCard || cleanCard.length < 16) { alert('Введите корректный номер карты (не менее 16 цифр)'); return; }
    if (isNaN(val) || val <= 0) { alert('Введите корректную сумму'); return; }

    const success = externalTransfer(cleanCard, val);
    if (success) {
      setSuccessData({ amount: val, recipientName: `КАРТА *${cleanCard.slice(-4)}`, cardUsed: currentUser.cards[selectedCard]?.number });
      setExtCard(''); setExtAmount('');
    } else {
      alert('Недостаточно средств на счете с учетом комиссии');
    }
  };

  if (successData) {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'var(--bg-dark)',
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.15), transparent 60%)',
        zIndex: 1000,
        display: 'flex', flexDirection: 'column',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', padding: '24px' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: 56, height: 56, background: 'var(--success-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-secondary)' }}>Перевод выполнен</h2>
          <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>{formatMoney(successData.amount)}</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{successData.recipientName}</p>
          {successData.cardUsed && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>С карты •••• {successData.cardUsed.split(' ').pop()}</p>
          )}
        </div>

        <div style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--border-glass)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <span style={{ flex: 1, fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>Сохранить чек</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a10 10 0 1 0 3.43-5.57L2 14"></path><polyline points="2 8 2 14 8 14"></polyline></svg>
            </div>
            <span style={{ flex: 1, fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>Повторить перевод</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>

          <button 
            style={{ width: '100%', padding: '16px', background: 'var(--success-color)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 600, marginTop: '8px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}
            onClick={() => setSuccessData(null)}
          >
            Вернуться
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 className="h2">Переводы</h2>

      {/* Card Selector — «Откуда» */}
      <div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Списать с карты</p>
        <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '10px' }}>
          {currentUser.cards.map((card, i) => (
            <button 
              key={card.id} 
              onClick={() => setSelectedCard(i)}
              style={{
                minWidth: '180px',
                padding: '14px 16px',
                borderRadius: '16px',
                background: selectedCard === i 
                  ? (i === 0 ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(2, 132, 199, 0.5))' : 'linear-gradient(135deg, #1f2937, #000)')
                  : 'var(--bg-glass)',
                border: selectedCard === i ? '1.5px solid var(--accent-color)' : '1px solid var(--border-glass)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                color: 'var(--text-primary)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: selectedCard === i ? 'var(--accent-color)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {card.typeName}
                </span>
                {selectedCard === i && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px var(--accent-color)' }}></div>
                )}
              </div>
              <span style={{ fontSize: '14px', fontFamily: 'monospace', letterSpacing: '1px', color: selectedCard === i ? 'white' : 'var(--text-secondary)' }}>
                {maskCardNumber(card.number)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Balance status */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Доступно на счете</p>
          <h2 style={{ fontSize: '20px' }}>{formatMoney(currentUser.internalBalance)}</h2>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
        </div>
      </div>

      {/* Transfer Type Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-glass)', borderRadius: '16px', padding: '4px', border: '1px solid var(--border-glass)' }}>
        <button 
          onClick={() => setActiveSection('internal')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: activeSection === 'internal' ? 'var(--accent-gradient)' : 'transparent', color: activeSection === 'internal' ? 'white' : 'var(--text-secondary)' }}
        >
          Клиенту WavePay
        </button>
        <button 
          onClick={() => setActiveSection('external')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: activeSection === 'external' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent', color: activeSection === 'external' ? 'white' : 'var(--text-secondary)' }}
        >
          На другой банк
        </button>
      </div>

      {/* Internal Transfer */}
      {activeSection === 'internal' && (
        <div className="glass-panel" style={{ animation: 'slideDown 0.25s ease-out' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Перевод клиенту банка</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Номер телефона или номер карты</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="+7 (777) 000-00-00" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {recipient && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-color)', fontSize: '14px', animation: 'fadeIn 0.3s ease-out' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Получатель: <b>{recipient.name}</b></span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Сумма ({fiatCurrency})</label>
            <input
              type="number"
              className="input-field"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="glass-panel" style={{ padding: '12px', marginBottom: '16px', background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '13px' }}>0% Комиссия</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Клиентам WavePay Bank</p>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleTransfer}>
            Перевести
          </button>
        </div>
      )}

      {/* External Transfer */}
      {activeSection === 'external' && (
        <div className="glass-panel" style={{ animation: 'slideDown 0.25s ease-out' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Перевод на карту другого банка</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Номер карты</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="0000 0000 0000 0000" 
              value={extCard}
              onChange={(e) => setExtCard(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Сумма ({fiatCurrency})</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="0.00" 
              value={extAmount}
              onChange={(e) => setExtAmount(e.target.value)}
            />
          </div>

          {/* Live commission calculation */}
          {extAmount && parseFloat(extAmount) > 0 && (
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', animation: 'slideDown 0.2s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Сумма перевода</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{formatMoney(parseFloat(extAmount))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Комиссия 0.01%</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b' }}>
                  {formatMoney(Math.max(50, parseFloat(extAmount) * 0.0001))}
                </span>
              </div>
              <div style={{ height: '1px', background: 'var(--border-glass)', margin: '4px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Итого к списанию</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>
                  {formatMoney(parseFloat(extAmount) + Math.max(50, parseFloat(extAmount) * 0.0001))}
                </span>
              </div>
              {parseFloat(extAmount) + Math.max(50, parseFloat(extAmount) * 0.0001) > currentUser.internalBalance && (
                <p style={{ fontSize: '12px', color: 'var(--danger-color)', marginTop: '10px', textAlign: 'center' }}>
                  ⚠ Недостаточно средств на счёте
                </p>
              )}
            </div>
          )}

          {(!extAmount || parseFloat(extAmount) <= 0) && (
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Комиссия 0.01% (мин. 50 {fiatCurrency})
            </p>
          )}

          <button className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)' }} onClick={handleExternalTransfer}>
            Отправить
          </button>
        </div>
      )}
    </div>
  );
}
