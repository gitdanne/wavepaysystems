import { useState, useContext } from 'react';
import { BankContext, COIN_META } from '../state/BankContext';

export default function Swap() {
  const { currentUser, swapCrypto, buyCrypto, sellCrypto } = useContext(BankContext);
  const [fromCoin, setFromCoin] = useState('BTC');
  const [toCoin, setToCoin] = useState('ETH');
  const [fromAmount, setFromAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const wallets = currentUser?.cryptoWallets || {};
  const allCoins = Object.keys(wallets);

  const fromRate = wallets[fromCoin]?.rate || 1;
  const toRate = wallets[toCoin]?.rate || 1;
  const exchangeRate = fromRate / toRate;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * exchangeRate * 0.997).toFixed(6) : '';
  const fee = fromAmount ? (parseFloat(fromAmount) * exchangeRate * 0.003).toFixed(6) : '0';

  const handleSwapCoins = () => {
    const temp = fromCoin;
    setFromCoin(toCoin);
    setToCoin(temp);
    setFromAmount('');
  };

  const handleSwap = async () => {
    const val = parseFloat(fromAmount);
    if (isNaN(val) || val <= 0) { alert('Введите сумму'); return; }
    if (fromCoin === toCoin) { alert('Выберите разные монеты'); return; }
    if (val > (wallets[fromCoin]?.balance || 0)) { alert('Недостаточно средств'); return; }

    setLoading(true);
    const ok = await swapCrypto(fromCoin, toCoin, val);
    setLoading(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setFromAmount(''); }, 2500);
    } else {
      alert('Ошибка при обмене');
    }
  };

  const formatFiat = (amt) => Number(amt).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' wcT';

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0, 212, 170, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-color)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Обмен выполнен!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{fromAmount} {fromCoin} → {toAmount} {toCoin}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 className="h2">Обмен крипто</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '-12px' }}>Мгновенный обмен между криптовалютами</p>

      {/* FROM */}
      <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.05), rgba(0,0,0,0))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Отдаёте</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Баланс: {Number(wallets[fromCoin]?.balance || 0).toFixed(6)} {fromCoin}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select value={fromCoin} onChange={e => setFromCoin(e.target.value)} style={{ background: `${COIN_META[fromCoin]?.color}20`, border: `1px solid ${COIN_META[fromCoin]?.color}40`, color: 'white', padding: '10px 14px', borderRadius: '14px', fontSize: '15px', fontWeight: 600, outline: 'none', cursor: 'pointer', minWidth: '110px' }}>
            {allCoins.map(c => <option key={c} value={c} style={{ color: 'black' }}>{COIN_META[c]?.icon} {c}</option>)}
          </select>
          <input type="number" className="input-field" placeholder="0.00" value={fromAmount} onChange={e => setFromAmount(e.target.value)} style={{ textAlign: 'right', fontSize: '20px', fontWeight: 700, flex: 1, background: 'transparent', border: 'none', padding: '8px' }} />
        </div>
        <button onClick={() => setFromAmount(String(wallets[fromCoin]?.balance || 0))} style={{ marginTop: '8px', background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>MAX</button>
      </div>

      {/* Swap Button */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
        <button onClick={handleSwapCoins} style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-gradient-multi)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0, 212, 170, 0.3)', transition: 'transform 0.2s', zIndex: 2 }}
          onMouseEnter={e => e.currentTarget.style.transform = 'rotate(180deg) scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
        </button>
      </div>

      {/* TO */}
      <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.05), rgba(0,0,0,0))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Получаете</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Баланс: {Number(wallets[toCoin]?.balance || 0).toFixed(6)} {toCoin}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select value={toCoin} onChange={e => setToCoin(e.target.value)} style={{ background: `${COIN_META[toCoin]?.color}20`, border: `1px solid ${COIN_META[toCoin]?.color}40`, color: 'white', padding: '10px 14px', borderRadius: '14px', fontSize: '15px', fontWeight: 600, outline: 'none', cursor: 'pointer', minWidth: '110px' }}>
            {allCoins.map(c => <option key={c} value={c} style={{ color: 'black' }}>{COIN_META[c]?.icon} {c}</option>)}
          </select>
          <div style={{ flex: 1, textAlign: 'right', fontSize: '20px', fontWeight: 700, padding: '8px', color: toAmount ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {toAmount || '0.00'}
          </div>
        </div>
      </div>

      {/* Exchange Info */}
      {fromAmount > 0 && (
        <div className="glass-panel" style={{ padding: '16px', animation: 'slideDown 0.2s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Курс обмена</span>
            <span>1 {fromCoin} = {exchangeRate.toFixed(6)} {toCoin}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Комиссия (0.3%)</span>
            <span style={{ color: 'var(--warning-color)' }}>{fee} {toCoin}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Стоимость в wcT</span>
            <span>{formatFiat(parseFloat(fromAmount) * fromRate)}</span>
          </div>
        </div>
      )}

      <button className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '16px' }} onClick={handleSwap} disabled={loading || !fromAmount}>
        {loading ? 'Обмениваем...' : `Обменять ${fromCoin} → ${toCoin}`}
      </button>
    </div>
  );
}
