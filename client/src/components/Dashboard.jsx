import { useContext, useState } from 'react';
import { BankContext, COIN_META } from '../state/BankContext';

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
    <div style={{ width: 36, height: 36, borderRadius: '12px', background: 'rgba(0, 230, 118, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
    </div>
  );
  return (
    <div style={{ width: 36, height: 36, borderRadius: '12px', background: 'rgba(255, 71, 87, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
    </div>
  );
};

export default function Dashboard({ navigateTo }) {
  const { currentUser, fiatCurrency, topUpBalance, getTotalPortfolioValue } = useContext(BankContext);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpCardIndex, setTopUpCardIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const formatMoney = (amount) => (amount || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' wcT';
  const formatCrypto = (amount, decimals = 6) => Number(amount || 0).toFixed(decimals);

  const totalPortfolio = getTotalPortfolioValue();
  const cryptoWallets = currentUser?.cryptoWallets || {};

  const handleTopUp = async () => {
    if (!topUpAmount || isNaN(topUpAmount) || parseFloat(topUpAmount) <= 0) { alert('Введите корректную сумму'); return; }
    const res = await topUpBalance(parseFloat(topUpAmount), topUpCardIndex);
    if (res) { setShowTopUp(false); setTopUpAmount(''); } else { alert('Ошибка при пополнении'); }
  };

  const notifications = [
    { id: 1, text: 'Ваш WaveCoin кошелёк активен и защищён', time: 'Сегодня', read: false },
    { id: 2, text: 'Добро пожаловать в WaveCoin Wallet!', time: 'Сегодня', read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Build assets list from crypto wallets
  const assets = Object.entries(cryptoWallets).map(([coin, wallet]) => ({
    coin,
    ...COIN_META[coin],
    balance: wallet.balance || 0,
    rate: wallet.rate || 0,
    value: (wallet.balance || 0) * (wallet.rate || 0),
    change24h: coin === 'BTC' ? 2.4 : coin === 'ETH' ? -1.2 : coin === 'SOL' ? 5.8 : coin === 'BNB' ? 0.9 : -0.3,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="h2 text-gradient">WaveCoin</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Привет, {currentUser.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowNotifications(p => !p)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {unreadCount > 0 && <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--danger-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white', border: '2px solid var(--bg-dark)' }}>{unreadCount}</div>}
          </button>
          <button onClick={() => navigateTo('profile')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </header>

      {/* Notifications */}
      {showNotifications && (
        <div className="glass-panel" style={{ animation: 'slideDown 0.25s ease-out' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Уведомления</h4>
          {notifications.map(n => (
            <div key={n.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-glass)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : 'var(--accent-color)', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '13px', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.text}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Balance Card */}
      <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.08), rgba(123, 97, 255, 0.06), rgba(0,0,0,0))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(0, 212, 170, 0.05)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Общий баланс портфеля</p>
          <button onClick={() => setBalanceHidden(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {balanceHidden ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>)}
            </svg>
          </button>
        </div>
        <h1 className="h1" style={{ fontSize: '30px' }}>{balanceHidden ? '• • • • • •' : formatMoney(totalPortfolio)}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
          <span style={{ color: 'var(--success-color)', fontSize: '13px', fontWeight: 600 }}>+2.4%</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>за 24ч</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <QuickAction label="Пополнить" color="var(--success-color)" onClick={() => setShowTopUp(true)}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>} />
        <QuickAction label="Отправить" color="var(--accent-color)" onClick={() => navigateTo('transfers')}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>} />
        <QuickAction label="Обменять" color="var(--accent-secondary)" onClick={() => navigateTo('swap')}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b61ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>} />
        <QuickAction label="Займ" color="var(--warning-color)" onClick={() => navigateTo('lending')}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffa502" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>} />
      </div>

      {/* WaveCash Balance */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.06), rgba(0,0,0,0))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 42, height: 42, borderRadius: '14px', background: 'rgba(0, 212, 170, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-color)' }}>W</span>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '15px' }}>WaveCash</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Основной баланс</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 700, fontSize: '16px' }}>{balanceHidden ? '••••' : formatMoney(currentUser.internalBalance)}</p>
        </div>
      </div>

      {/* Crypto Assets */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Крипто-активы</h3>
          <button onClick={() => navigateTo('market')} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Все →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {assets.map(asset => (
            <div key={asset.coin} className="glass-panel" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onClick={() => navigateTo('market')}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-glass)'; }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${asset.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: asset.color, flexShrink: 0 }}>
                {asset.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{asset.name}</p>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{balanceHidden ? '••••' : formatMoney(asset.value)}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatCrypto(asset.balance, asset.coin === 'ADA' ? 1 : 4)} {asset.coin}</p>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: asset.change24h >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div onClick={() => setShowHistory(p => !p)} className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', border: showHistory ? '1px solid var(--accent-color)' : '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 42, height: 42, borderRadius: '14px', background: 'rgba(0, 212, 170, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '15px' }}>История операций</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{currentUser.transactions.length === 0 ? 'Нет операций' : `${currentUser.transactions.length} операций`}</p>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease', transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      {showHistory && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'slideDown 0.25s ease-out' }}>
          {currentUser.transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Операций пока нет</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>Пополните кошелёк, чтобы начать</p>
            </div>
          )}
          {currentUser.transactions.map(tx => (
            <div key={tx.id} className="glass-panel" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.15s ease' }} onClick={() => setSelectedTx(tx)}>
              <TxIcon type={tx.type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString('ru-RU')}</p>
              </div>
              <span style={{ color: tx.type === 'income' ? 'var(--success-color)' : 'var(--text-primary)', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
                {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedTx(null); }}>
          <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-dark)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: selectedTx.type === 'income' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 71, 87, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <TxIcon type={selectedTx.type} />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{selectedTx.type === 'income' ? 'Поступление' : 'Списание'}</p>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: selectedTx.type === 'income' ? 'var(--success-color)' : 'var(--text-primary)' }}>
                {selectedTx.type === 'income' ? '+' : '-'}{formatMoney(selectedTx.amount)}
              </h2>
            </div>
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
              {[
                ['Операция', selectedTx.name],
                ['Дата', new Date(selectedTx.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })],
                ['Статус', '✓ Выполнено'],
                ['ID', '#' + String(selectedTx.id).slice(-8).toUpperCase()],
              ].map(([l, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border-glass)' : 'none' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{l}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }} onClick={() => setSelectedTx(null)}>Закрыть</button>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {showTopUp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setShowTopUp(false); }}>
          <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-dark)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Пополнить кошелёк</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Выберите кошелёк и сумму</p>
            <select value={topUpCardIndex} onChange={e => setTopUpCardIndex(Number(e.target.value))} className="input-field" style={{ marginBottom: '16px', padding: '12px' }}>
              {currentUser.cards.map((c, i) => (
                <option key={i} value={i} style={{ color: 'black' }}>{c.name} — {formatMoney(c.balance)}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[5000, 10000, 50000, 100000].map(preset => (
                <button key={preset} className="btn" style={{ flex: 1, padding: '10px 4px', fontSize: '12px', borderRadius: '12px' }} onClick={() => setTopUpAmount(String(preset))}>
                  {preset >= 1000 ? `${preset/1000}K` : preset}
                </button>
              ))}
            </div>
            <input type="number" className="input-field" placeholder="Сумма wcT" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} style={{ marginBottom: '16px', fontSize: '20px', textAlign: 'center', fontWeight: 600 }} />
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }} onClick={handleTopUp}>
              Пополнить {topUpAmount && formatMoney(parseFloat(topUpAmount) || 0)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
