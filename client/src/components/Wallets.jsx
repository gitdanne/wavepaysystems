import { useContext, useState } from 'react';
import { BankContext, COIN_META } from '../state/BankContext';

export default function Wallets({ navigateTo }) {
  const { currentUser, fiatCurrency } = useContext(BankContext);
  const [expandedWallet, setExpandedWallet] = useState(null);
  const [ordered, setOrdered] = useState(false);

  const formatMoney = (amount) => {
    return (amount || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' wcT';
  };

  const formatCrypto = (amount, decimals = 6) => Number(amount || 0).toFixed(decimals);

  // Generate fake addresses based on user id and coin
  const getWalletAddress = (coin) => {
    const base = currentUser._id || '1a2b3c4d5e6f';
    if (coin === 'BTC') return `bc1q${base.slice(0, 8)}...${base.slice(-4)}`;
    if (coin === 'SOL') return `${base.slice(0, 4)}...${base.slice(-4)}...SOL`;
    return `0x${base.slice(0, 6)}...${base.slice(-4)}`;
  };

  const handleOrder = () => {
    alert("Заявка на выпуск пластиковой карты WaveCoin Metal принята!");
    setOrdered(true);
  };

  const cryptoWallets = currentUser?.cryptoWallets || {};
  const walletsList = [
    {
      coin: 'wcT',
      name: 'WaveCash',
      icon: 'W',
      color: '#00d4aa',
      balance: currentUser?.internalBalance || 0,
      value: currentUser?.internalBalance || 0,
      symbol: 'wcT',
      network: 'WaveCoin Native'
    },
    ...Object.entries(cryptoWallets).map(([coin, wallet]) => ({
      coin,
      ...COIN_META[coin],
      balance: wallet.balance || 0,
      value: (wallet.balance || 0) * (wallet.rate || 0),
      network: coin === 'BTC' ? 'Bitcoin' : coin === 'SOL' ? 'Solana' : coin === 'ADA' ? 'Cardano' : 'ERC-20'
    }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="h2">Мои кошельки</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {walletsList.map((wallet, index) => {
          const isExpanded = expandedWallet === index;
          
          return (
            <div key={wallet.coin} className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: isExpanded ? `1px solid ${wallet.color}` : '1px solid var(--border-glass)', transition: 'all 0.3s ease' }}>
              
              {/* Wallet Header (Always visible) */}
              <div onClick={() => setExpandedWallet(isExpanded ? null : index)} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: isExpanded ? `${wallet.color}0a` : 'transparent' }}>
                <div style={{ width: 48, height: 48, borderRadius: '14px', background: `${wallet.color}20`, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, fontSize: '20px', color: wallet.color, fontWeight: 'bold' }}>
                  {wallet.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{wallet.name}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{wallet.network}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{formatMoney(wallet.value)}</div>
                  {wallet.coin !== 'wcT' && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {formatCrypto(wallet.balance)} {wallet.symbol}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px 20px', animation: 'slideDown 0.3s ease-out' }}>
                  <div style={{ height: '1px', background: 'var(--border-glass)', margin: '0 0 16px 0' }} />
                  
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Адрес получения ({wallet.network})</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.5px' }}>{getWalletAddress(wallet.coin)}</span>
                      <button style={{ background: 'none', border: 'none', color: wallet.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }} onClick={() => alert('Адрес скопирован!')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        Копировать
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn" style={{ flex: 1, padding: '12px', background: `${wallet.color}20`, color: wallet.color, border: `1px solid ${wallet.color}40` }} onClick={() => alert(`QR код для ${wallet.name} сгенерирован`)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                      Получить
                    </button>
                    <button className="btn" style={{ flex: 1, padding: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }} onClick={() => navigateTo('transfers')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      Отправить
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Crypto Card Order */}
      <div className="glass-panel" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0, 212, 170, 0.05))' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
        </div>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>WaveCoin Visa Card</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Тратьте свою криптовалюту напрямую с помощью премиальной металлической карты.</p>
        <button className="btn btn-primary" onClick={handleOrder} disabled={ordered} style={{ width: '100%' }}>
          {ordered ? 'Заявка обрабатывается...' : 'Заказать карту бесплатно'}
        </button>
      </div>
    </div>
  );
}
