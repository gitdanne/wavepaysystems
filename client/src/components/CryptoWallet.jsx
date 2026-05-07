import { useState, useContext } from 'react';
import { BankContext } from '../state/BankContext';

export default function CryptoWallet() {
  const { currentUser, fiatCurrency, fiatRateToUsd, buyCrypto, sellCrypto } = useContext(BankContext);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('buy'); // buy, sell, receive, send

  const formatFiat = (amt) => Number(amt).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' wcT';
  const formatCrypto = (amt, coin) => `${Number(amt).toFixed(6)} ${coin}`;

  const currentWallet = currentUser.cryptoWallets[selectedCoin];
  const coinRateFiat = currentWallet.rate * fiatRateToUsd;

  const handleTransaction = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    if (action === 'buy') {
      const success = buyCrypto(selectedCoin, val);
      if (success) setAmount('');
      else alert('Недостаточно фиатных средств на банковском счете!');
    } else if (action === 'sell') {
      const success = sellCrypto(selectedCoin, val);
      if (success) setAmount('');
      else alert('Недостаточно криптовалюты на балансе!');
    } else if (action === 'send') {
      alert(`Транзакция ${val} ${selectedCoin} отправлена в сеть монеты. Она будет обработана после 3 подтверждений сети.`);
      setAmount('');
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(currentWallet.address);
    alert('Адрес Wallet ID скопирован в буфер обмена!');
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ position: 'absolute', inset: -10, zIndex: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 50, marginBottom: 20 }}>❄️</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Сервис временно заморожен</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Мы обновляем протоколы безопасности и ликвидности.<br/>Крипто-операции будут доступны в ближайшее время.</p>
      </div>
      <h2 className="h2">Криптокошелек</h2>
      
      {/* Portfolio Total */}
      <div className="glass-panel" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(0,0,0,0))' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Общий баланс портфеля</p>
        <h1 className="h1 text-gradient">
          {formatFiat(
            Object.values(currentUser.cryptoWallets).reduce((acc, curr) => acc + (curr.balance * curr.rate * fiatRateToUsd), 0)
          )}
        </h1>
      </div>

      {/* Coin Selector */}
      <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '8px' }}>
        {Object.keys(currentUser.cryptoWallets).map(coin => (
          <button 
            key={coin} 
            onClick={() => { setSelectedCoin(coin); setAction('buy'); setAmount(''); }}
            className="btn"
            style={{ 
              borderRadius: '24px', 
              padding: '8px 16px',
              border: selectedCoin === coin ? '1px solid var(--accent-color)' : '1px solid var(--border-glass)',
              background: selectedCoin === coin ? 'rgba(14, 165, 233, 0.2)' : 'var(--bg-glass)',
              whiteSpace: 'nowrap'
            }}
          >
            {coin} • {formatCrypto(currentUser.cryptoWallets[coin].balance, '')}
          </button>
        ))}
      </div>

      {/* Coin Specific Page - "Receive" & "Address" UI */}
      <div className="glass-panel" style={{ borderStyle: 'solid', borderColor: 'var(--border-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 className="h2">{selectedCoin} Обзор</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Баланс: {formatCrypto(currentWallet.balance, selectedCoin)}</p>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Ваш публичный адрес (Wallet ID)</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <p style={{ fontFamily: 'monospace', color: 'var(--accent-color)', wordBreak: 'break-all', fontSize: '14px' }}>
              {currentWallet.address}
            </p>
            <button className="btn" style={{ padding: '8px' }} onClick={copyAddress}>Copy</button>
          </div>
        </div>

        {/* Global actions row */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button className="btn" style={{ flex: 1, minWidth: '80px', fontSize: '14px', background: action === 'receive' ? 'var(--accent-gradient)' : 'var(--bg-glass)' }} onClick={() => setAction('receive')}>Deposit</button>
          <button className="btn" style={{ flex: 1, minWidth: '80px', fontSize: '14px', background: action === 'send' ? 'var(--accent-gradient)' : 'var(--bg-glass)' }} onClick={() => setAction('send')}>Send</button>
          <button className="btn" style={{ flex: 1, minWidth: '80px', fontSize: '14px', background: action === 'buy' ? 'var(--accent-gradient)' : 'var(--bg-glass)' }} onClick={() => setAction('buy')}>Buy</button>
          <button className="btn" style={{ flex: 1, minWidth: '80px', fontSize: '14px', background: action === 'sell' ? 'var(--accent-gradient)' : 'var(--bg-glass)' }} onClick={() => setAction('sell')}>Sell</button>
        </div>

        {/* Conditional Action UI */}

        {action === 'receive' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 160, height: 160, background: 'white', margin: '0 auto 16px', padding: '16px', borderRadius: '16px' }}>
              {/* Mock QR Code Pattern */}
              <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, #000, #000 10px, #fff 10px, #fff 20px)' }}></div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Покажите этот QR код отправителю</p>
          </div>
        )}

        {action === 'send' && (
          <div>
            <input type="text" className="input-field" placeholder={`Адрес получателя ${selectedCoin}`} style={{ marginBottom: '12px' }} />
            <input type="number" className="input-field" placeholder={`Сумма ${selectedCoin}`} value={amount} onChange={e => setAmount(e.target.value)} style={{ marginBottom: '16px' }} />
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleTransaction}>Отправить по сети</button>
          </div>
        )}

        {(action === 'buy' || action === 'sell') && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Рыночный курс: {formatFiat(coinRateFiat)}</span>
              <span style={{ color: 'var(--accent-color)' }}>Комиссия: 0.14%</span>
            </div>

            <input 
              type="number" 
              className="input-field" 
              placeholder={action === 'buy' ? `Количество для покупки в ${selectedCoin}` : `Сумма для продажи в ${selectedCoin}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ marginBottom: '16px' }}
            />
            
            {amount > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Сумма сделки:</span>
                  <span>{formatFiat(amount * currentWallet.rate * fiatRateToUsd)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--danger-color)' }}>
                  <span>Комиссия среды (0.14%):</span>
                  <span>{action === 'buy' ? '+' : '-'} {formatFiat(amount * currentWallet.rate * fiatRateToUsd * 0.0014)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px dashed var(--border-glass)', paddingTop: '8px' }}>
                  <span>{action === 'buy' ? 'К списанию' : 'Вы получите на счет'}:</span>
                  <span className="text-gradient">
                    {action === 'buy' 
                      ? formatFiat((amount * currentWallet.rate * fiatRateToUsd) * 1.0014)
                      : formatFiat((amount * currentWallet.rate * fiatRateToUsd) * 0.9986)}
                  </span>
                </div>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleTransaction}>
              {action === 'buy' ? `Купить ${selectedCoin}` : `Продать ${selectedCoin}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
