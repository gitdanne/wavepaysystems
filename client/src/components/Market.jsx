import { useState, useContext } from 'react';
import { BankContext, COIN_META } from '../state/BankContext';
import ChartWidget from './ChartWidget';

export default function Market({ navigateTo }) {
  const { currentUser, buyCrypto, sellCrypto } = useContext(BankContext);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [action, setAction] = useState('buy');
  const [amount, setAmount] = useState('');

  const formatFiat = (amt) => Number(amt).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' wcT';

  const coins = Object.entries(currentUser?.cryptoWallets || {}).map(([coin, wallet]) => ({
    coin, ...COIN_META[coin], balance: wallet.balance, rate: wallet.rate,
    value: wallet.balance * wallet.rate,
    change24h: coin === 'BTC' ? 2.4 : coin === 'ETH' ? -1.2 : coin === 'SOL' ? 5.8 : coin === 'BNB' ? 0.9 : -0.3,
    marketCap: coin === 'BTC' ? '1.34T' : coin === 'ETH' ? '420B' : coin === 'SOL' ? '65B' : coin === 'BNB' ? '90B' : '25B',
    vol24h: coin === 'BTC' ? '28B' : coin === 'ETH' ? '15B' : coin === 'SOL' ? '3.2B' : coin === 'BNB' ? '1.8B' : '0.9B',
  }));

  const handleTrade = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    const success = action === 'buy' ? await buyCrypto(selectedCoin, val) : await sellCrypto(selectedCoin, val);
    if (success) { setAmount(''); alert(`${action === 'buy' ? 'Покупка' : 'Продажа'} ${val} ${selectedCoin} выполнена!`); }
    else alert(action === 'buy' ? 'Недостаточно WaveCash!' : 'Недостаточно крипты!');
  };

  if (selectedCoin) {
    const coin = coins.find(c => c.coin === selectedCoin);
    const wallet = currentUser.cryptoWallets[selectedCoin];
    const costFiat = amount > 0 ? amount * wallet.rate : 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSelectedCoin(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${coin.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: coin.color }}>{coin.icon}</div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{coin.name}</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{coin.symbol}/wcT</p>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{formatFiat(wallet.rate)}</h3>
            <span style={{ color: coin.change24h >= 0 ? 'var(--success-color)' : 'var(--danger-color)', fontSize: '13px', fontWeight: 600 }}>
              {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h)}%
            </span>
          </div>
        </div>

        {/* Live Chart */}
        <div className="glass-panel" style={{ padding: '16px 8px' }}>
          <ChartWidget coinSymbol={coin.symbol} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[['Ваш баланс', `${Number(wallet.balance).toFixed(6)} ${selectedCoin}`], ['Стоимость', formatFiat(coin.value)]].map(([l, v], i) => (
            <div key={i} className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 4 }}>{l}</p>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>{v}</p>
            </div>
          ))}
        </div>

        {/* Buy/Sell Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-glass)', borderRadius: '16px', padding: '4px', border: '1px solid var(--border-glass)' }}>
          <button onClick={() => setAction('buy')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', background: action === 'buy' ? 'var(--accent-gradient)' : 'transparent', color: action === 'buy' ? '#0a0b0f' : 'var(--text-secondary)' }}>Купить</button>
          <button onClick={() => setAction('sell')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', background: action === 'sell' ? 'linear-gradient(135deg, #ff4757, #ff6b81)' : 'transparent', color: action === 'sell' ? 'white' : 'var(--text-secondary)' }}>Продать</button>
        </div>

        {/* Trade form */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Курс: {formatFiat(wallet.rate)}</span>
            <span style={{ color: 'var(--accent-color)' }}>Комиссия: 0.14%</span>
          </div>
          <input type="number" className="input-field" placeholder={`Количество ${selectedCoin}`} value={amount} onChange={e => setAmount(e.target.value)} style={{ marginBottom: '16px' }} />
          {amount > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Сумма:</span>
                <span>{formatFiat(costFiat)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px dashed var(--border-glass)', paddingTop: '8px' }}>
                <span>{action === 'buy' ? 'К списанию' : 'Вы получите'}:</span>
                <span className="text-gradient">{formatFiat(action === 'buy' ? costFiat * 1.0014 : costFiat * 0.9986)}</span>
              </div>
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleTrade}>
            {action === 'buy' ? `Купить ${selectedCoin}` : `Продать ${selectedCoin}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 className="h2">Рынок</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '-12px' }}>Курсы криптовалют в реальном времени</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {coins.map(coin => (
          <div key={coin.coin} onClick={() => { setSelectedCoin(coin.coin); setAction('buy'); setAmount(''); }} className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${coin.color}40`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-glass)'; }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${coin.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: coin.color, flexShrink: 0 }}>{coin.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '15px' }}>{coin.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{coin.symbol}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 600, fontSize: '15px' }}>{formatFiat(coin.rate)}</p>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: coin.change24h >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                  </p>
                </div>
              </div>
              {/* Mini sparkline */}
              <div style={{ marginTop: '10px', height: '30px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                <svg width="100%" height="30" viewBox="0 0 200 30" preserveAspectRatio="none">
                  <path d={coin.change24h >= 0 ? "M0 25 Q25 20 50 18 T100 15 T150 10 T200 5" : "M0 8 Q25 12 50 10 T100 18 T150 22 T200 25"} fill="none" stroke={coin.change24h >= 0 ? 'var(--success-color)' : 'var(--danger-color)'} strokeWidth="2" />
                  <path d={coin.change24h >= 0 ? "M0 25 Q25 20 50 18 T100 15 T150 10 T200 5 V30 H0 Z" : "M0 8 Q25 12 50 10 T100 18 T150 22 T200 25 V30 H0 Z"} fill={coin.change24h >= 0 ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 71, 87, 0.08)'} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
