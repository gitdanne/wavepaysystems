import { useContext, useState } from 'react';
import { BankContext } from '../state/BankContext';

export const MULTI_CURRENCIES = [
  { code: 'KZT', name: 'Тенге', flag: '🇰🇿', rate: 1 },
  { code: 'USD', name: 'Доллар США', flag: '🇺🇸', rate: 450 },
  { code: 'EUR', name: 'Евро', flag: '🇪🇺', rate: 490 },
  { code: 'RUB', name: 'Рубль', flag: '🇷🇺', rate: 5.2 },
  { code: 'GBP', name: 'Фунт', flag: '🇬🇧', rate: 570 },
  { code: 'CNY', name: 'Юань', flag: '🇨🇳', rate: 62 },
  { code: 'TRY', name: 'Лира', flag: '🇹🇷', rate: 14 },
  { code: 'AED', name: 'Дирхам', flag: '🇦🇪', rate: 122 },
  { code: 'JPY', name: 'Иена', flag: '🇯🇵', rate: 2.9 },
  { code: 'GEL', name: 'Лари', flag: '🇬🇪', rate: 165 },
  { code: 'UZS', name: 'Сум', flag: '🇺🇿', rate: 0.035 },
  { code: 'KGS', name: 'Сом', flag: '🇰🇬', rate: 5.2 },
];

const DetailRow = ({ label, value, accent, hidden, onToggle }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: accent ? 'var(--accent-color)' : 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
        {hidden ? '••••••••' : value}
      </span>
      {onToggle && (
        <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {hidden ? (
              <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>
            ) : (
              <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path><line x1="1" y1="1" x2="23" y2="23"></line></>
            )}
          </svg>
        </button>
      )}
    </div>
  </div>
);

const maskCardNumber = (number) => {
  const parts = number.split(' ');
  if (parts.length >= 4) {
    return `•••• •••• •••• ${parts[parts.length - 1]}`;
  }
  return '•••• •••• •••• ••••';
};

export default function Cards({ navigateTo }) {
  const { currentUser, fiatCurrency, topUpBalance, fiatRateToUsd, updateCardSettings, closeCard } = useContext(BankContext);
  const [ordered, setOrdered] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeNfcCard, setActiveNfcCard] = useState(null);
  const [showCvv, setShowCvv] = useState(false);
  const [showNumber, setShowNumber] = useState(false);
  const [showIban, setShowIban] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: fiatCurrency }).format(amount);
  };

  const cryptoPortfolioBalance = currentUser?.cryptoWallets ? Object.values(currentUser.cryptoWallets).reduce((acc, curr) => acc + (curr.balance * curr.rate * fiatRateToUsd), 0) : 0;

  const handleNFC = (card, index, e) => {
    if (activeNfcCard === index) {
      setActiveNfcCard(null);
    } else {
      setActiveNfcCard(index);
      if (e && e.currentTarget) {
        e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };
  const handleApplePay = () => alert("Карта успешна добавлена в кошелек!");
  const handleOrder = () => {
    alert("Заявка на выпуск пластиковой карты WavePay Platinum принята!");
    setOrdered(true);
  };

  const toggleCard = (index) => {
    setExpandedCard(prev => prev === index ? null : index);
    setShowCvv(false);
    setShowNumber(false);
    setShowIban(false);
  };

  const handleTopUp = () => {
    alert('Пополнение доступно только через банкоматы WavePay или банковским переводом по реквизитам.');
  };

  const handleTransferFromCard = (cardIndex) => {
    navigateTo('transfers', { selectedCardIndex: cardIndex });
  };

  const handleCloseCard = async (cardIndex) => {
    if (window.confirm("Вы уверены, что хотите закрыть эту карту? Остаток средств будет переведен на основную электронную карту.")) {
      const success = await closeCard(cardIndex);
      if (success) {
        setExpandedCard(null);
        setActiveNfcCard(null);
        alert("Карта успешно закрыта");
      } else {
        alert("Ошибка при закрытии карты. Нельзя закрыть основную карту.");
      }
    }
  };

  const cardDetails = currentUser.cards.map((card, index) => ({
    holder: currentUser.name,
    name: card.name,
    number: card.number,
    type: card.typeName,
    expiry: '12/29', // В реальном приложении брать из базы
    cvv: card.cvv || '000',
    iban: 'KZ86 125K ZT00 4100 ' + card.number.slice(-4),
    bik: 'WAVEKZKA',
    iin: '260401550012',
    kbe: '19',
    bank: 'WavePay Digital Bank',
    isCrypto: card.name === 'WavePay Crypto',
    defaultCrypto: card.defaultCrypto || 'BTC',
    cardIndex: index
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 className="h2">Мои карты</h2>

      <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '24px', paddingTop: '8px', margin: '0 -24px', paddingLeft: 'calc(50vw - 150px)', paddingRight: 'calc(50vw - 150px)', scrollSnapType: 'x mandatory' }}>
        {currentUser.cards.length === 0 ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-secondary)', width: '100%', background: 'var(--bg-glass)', borderRadius: '24px', border: '1px dashed var(--border-glass)' }}>
            <div style={{ width: 48, height: 48, margin: '0 auto 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>У вас нет активных карт</p>
            <p style={{ fontSize: '13px' }}>Откройте новую карту на главном экране</p>
          </div>
        ) : (
          currentUser.cards.map((card, index) => {
            const isCrypto = card.name === 'WavePay Crypto';
            const isMulticurrency = card.name === 'WavePay Мультивалютная';
            const isFreelance = card.name === 'WavePay Самозанятые';
            
            let background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(2, 132, 199, 0.8))';
            let textColor = 'white';
            let title = 'WAVEPAY';
            
            if (isCrypto) {
              background = 'linear-gradient(135deg, #1f2937, #000000)';
              textColor = '#e5e7eb';
              title = 'CRYPTO METAL';
            } else if (isFreelance) {
              background = 'linear-gradient(135deg, #065f46, #047857, #10b981)';
              title = 'FREELANCE';
            } else if (isMulticurrency) {
              background = 'linear-gradient(135deg, #4c1d95, #7e22ce, #a855f7)';
              title = 'MULTI CURENCY';
            }
            
            const isActive = activeNfcCard === index;
            const isAnyActive = activeNfcCard !== null;
            
            const cardScale = isAnyActive ? (isActive ? 'scale(1.02) translateY(-4px)' : 'scale(0.92)') : 'scale(1)';
            const cardOpacity = isAnyActive ? (isActive ? 1 : 0.6) : 1;
            
            return (
              <div key={index} onClick={(e) => handleNFC(card, index, e)} style={{ minWidth: '300px', height: '190px', borderRadius: '24px', background, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', scrollSnapAlign: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', border: isActive ? '2px solid #38bdf8' : '2px solid transparent', color: textColor, transform: cardScale, opacity: cardOpacity, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{title}</h3>
                  {isCrypto ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                  ) : (
                    <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><path d="M15.4 0H0L12 24H27.4L15.4 0Z" fill="currentColor" opacity="0.8"/><path d="M28 0H12L24 24H40L28 0Z" fill="currentColor" opacity="0.4"/></svg>
                  )}
                </div>
                
                <div>
                  <p style={{ letterSpacing: '2px', fontSize: '18px', fontFamily: 'monospace', marginBottom: '8px' }}>{maskCardNumber(card.number)}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.8 }}>
                    <span>{isCrypto ? `Баланс: ${formatMoney(cryptoPortfolioBalance)}` : (isFreelance ? 'Business' : `Баланс: ${formatMoney(card.balance)}`)}</span>
                    <span>12/29</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {currentUser.cards.length > 0 && activeNfcCard !== null && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-12px', marginBottom: '16px', height: '40px', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '8px 20px', borderRadius: '24px', color: 'var(--accent-color)', fontSize: '13px', fontWeight: 600, animation: 'nfcPulse 2s infinite' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a14 14 0 0 1 16 0"/><path d="M7 14a10 10 0 0 1 10 0"/><path d="M10 18a6 6 0 0 1 4 0"/></svg>
            Готово к оплате
          </div>
          <style>
            {`
              @keyframes nfcPulse {
                0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(14, 165, 233, 0); }
                100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
              }
            `}
          </style>
        </div>
      )}

      {currentUser.cards.length > 0 && (
        <>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '8px' }}>Список карт</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentUser.cards.map((card, index) => {
              const isCrypto = card.name === 'WavePay Crypto';
              const isFreelance = card.name === 'WavePay Самозанятые';
              const isMulticurrency = card.name === 'WavePay Мультивалютная';
              
              let iconBg = 'rgba(14, 165, 233, 0.2)';
              let iconColor = '#0ea5e9';
              if (isCrypto) { iconBg = 'rgba(245, 158, 11, 0.2)'; iconColor = '#f59e0b'; }
              else if (isFreelance) { iconBg = 'rgba(16, 185, 129, 0.2)'; iconColor = '#10b981'; }
              else if (isMulticurrency) { iconBg = 'rgba(168, 85, 247, 0.2)'; iconColor = '#a855f7'; }

              return (
                <div key={index} onClick={() => toggleCard(index)} className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'transform 0.2s', border: expandedCard === index ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: iconBg, color: iconColor, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                    {isCrypto ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{card.name}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>•••• {card.number.slice(-4)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>{isCrypto ? formatMoney(cryptoPortfolioBalance) : formatMoney(card.balance)}</div>
                    {isMulticurrency && <div style={{ fontSize: '11px', color: '#a855f7', marginTop: '4px' }}>12 валют</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Card Details Panel */}
      {expandedCard !== null && cardDetails[expandedCard] && (
        <div className="glass-panel" style={{ animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Реквизиты карты</h3>
            <button onClick={() => setExpandedCard(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px', padding: '4px 8px' }}>✕</button>
          </div>
          
          <DetailRow label="Держатель" value={cardDetails[expandedCard].holder} />
          <DetailRow 
            label="Номер карты" 
            value={cardDetails[expandedCard].number} 
            accent 
            hidden={!showNumber} 
            onToggle={() => setShowNumber(p => !p)} 
          />
          <DetailRow label="Тип карты" value={cardDetails[expandedCard].type} />
          <DetailRow label="Срок действия" value={cardDetails[expandedCard].expiry} />
          <DetailRow 
            label="CVV" 
            value={cardDetails[expandedCard].cvv} 
            hidden={!showCvv} 
            onToggle={() => setShowCvv(p => !p)} 
          />
          <DetailRow 
            label="IBAN" 
            value={cardDetails[expandedCard].iban} 
            accent 
            hidden={!showIban} 
            onToggle={() => setShowIban(p => !p)} 
          />
          <DetailRow label="БИК" value={cardDetails[expandedCard].bik} />
          <DetailRow label="КБе" value={cardDetails[expandedCard].kbe} />
          <DetailRow label="Банк" value={cardDetails[expandedCard].bank} />

          {cardDetails[expandedCard].isCrypto && currentUser?.cryptoWallets && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Списывать с крипты</span>
              <select 
                value={cardDetails[expandedCard].defaultCrypto}
                onChange={(e) => updateCardSettings(cardDetails[expandedCard].cardIndex, { defaultCrypto: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '4px 8px', fontSize: '13px', outline: 'none' }}
              >
                {Object.keys(currentUser.cryptoWallets).map(coin => (
                  <option key={coin} value={coin} style={{ color: 'black' }}>{coin}</option>
                ))}
              </select>
            </div>
          )}

          {/* Multicurrency Wallet */}
          {currentUser.cards[expandedCard]?.name === 'WavePay Мультивалютная' && (
            <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: '#a855f7' }}>💱 Мультивалютный кошелёк</h4>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>12 валют</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                Основной баланс в KZT. Автоконвертация при переводе в любой из 12 валют.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                {MULTI_CURRENCIES.map(cur => {
                  const balanceKZT = currentUser.cards[expandedCard]?.balance || 0;
                  const converted = cur.rate === 1 ? balanceKZT : (balanceKZT / cur.rate);
                  return (
                    <div key={cur.code} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                      borderRadius: 12, background: cur.code === 'KZT' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: cur.code === 'KZT' ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <span style={{ fontSize: 20 }}>{cur.flag}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{cur.code}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cur.name}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>
                          {cur.code === 'KZT'
                            ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT' }).format(balanceKZT)
                            : converted.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + cur.code
                          }
                        </p>
                        {cur.code !== 'KZT' && (
                          <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>1 {cur.code} = {cur.rate.toLocaleString()} ₸</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, minWidth: '120px', fontSize: '14px', padding: '14px' }}
              onClick={() => handleTransferFromCard(expandedCard)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              Перевести
            </button>
            <button 
              className="btn" 
              style={{ flex: 1, minWidth: '120px', fontSize: '14px', padding: '14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--success-color)' }}
              onClick={handleTopUp}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Пополнить
            </button>
            {cardDetails[expandedCard].name !== 'WavePay Electronic' && (
              <button 
                className="btn" 
                style={{ flex: '1 1 100%', fontSize: '14px', padding: '14px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--danger-color)' }}
                onClick={() => handleCloseCard(cardDetails[expandedCard].cardIndex)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                Закрыть карту
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card Actions */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button className="btn" onClick={handleApplePay} style={{ background: '#000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none', borderRadius: '14px', padding: '14px 24px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}>
          <svg width="20" height="24" viewBox="0 0 814 1000" fill="white" style={{ flexShrink: 0 }}>
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.3-155.5-127c-56.1-78-101.8-199.3-101.8-314.8 0-185.2 120.4-283.6 238.9-283.6 62.9 0 115.5 41.3 155 41.3 37.6 0 96.2-43.8 167.6-43.8 27.1 0 124.4 2.4 188.9 90.9zM554.1 159.4c31.1-36.9 53.1-88.1 53.1-139.4 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4.6 13.5.6 45.6 0 103-30.4 135.6-70.5z"/>
          </svg>
          Добавить в Apple Pay
        </button>
        <button className="btn" onClick={handleApplePay} style={{ background: '#fff', color: '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '1px solid #dadce0', borderRadius: '14px', padding: '14px 24px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.8 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.8-3.2-11.2-7.8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.2-2.7-.4-3.9z"/>
          </svg>
          Добавить в Google Wallet
        </button>
      </div>

      {/* Physical Card Order */}
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
        </div>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Пластиковая карта WavePay</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Закажите премиальный пластик с бесплатной доставкой на дом. Снимайте наличные бесплатно.</p>
        <button className="btn btn-primary" onClick={handleOrder} disabled={ordered} style={{ width: '100%' }}>
          {ordered ? 'В процессе доставки...' : 'Заказать карту бесплатно'}
        </button>
      </div>

    </div>
  );
}
