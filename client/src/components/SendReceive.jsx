import { useState, useContext, useEffect } from 'react';
import { BankContext, COIN_META } from '../state/BankContext';

export default function SendReceive({ navParams, navigateTo }) {
  const { currentUser, internalTransfer, findRecipient } = useContext(BankContext);
  const [activeTab, setActiveTab] = useState('send'); // 'send' | 'receive'
  const [sendMethod, setSendMethod] = useState('phone'); // 'phone' | 'address'
  
  // Send State
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('wcT');
  const [recipient, setRecipient] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    let active = true;
    if (sendMethod === 'phone' && phone.length >= 10) {
      findRecipient(phone).then(res => {
        if (active) setRecipient(res);
      });
    } else {
      setRecipient(null);
    }
    return () => { active = false; };
  }, [phone, sendMethod, findRecipient]);

  const assets = [
    { coin: 'wcT', name: 'WaveCash', balance: currentUser.internalBalance || 0, color: 'var(--accent-color)' },
    ...Object.entries(currentUser?.cryptoWallets || {}).map(([coin, wallet]) => ({
      coin,
      name: COIN_META[coin]?.name || coin,
      balance: wallet.balance || 0,
      color: COIN_META[coin]?.color || '#ffffff'
    }))
  ];

  const handleSend = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) { alert('Введите корректную сумму'); return; }

    if (sendMethod === 'phone') {
      if (!phone || phone.length < 10) { alert('Введите корректный номер телефона'); return; }
      if (!recipient) { alert('Пользователь не найден в системе WaveCoin'); return; }
      
      // Currently only internal transfer supports wcT (WaveCash). For crypto, we'd need to extend backend.
      // Assuming internalTransfer takes phone and amount of wcT (card index 0 used as main wallet).
      if (selectedAsset !== 'wcT') {
        alert('Перевод криптоактивов по номеру телефона в разработке. Используйте адрес кошелька.');
        return;
      }

      const res = await internalTransfer(phone, val, 0); // Using 0 as main wallet index
      if (res) {
        setSuccessData({ amount: val, asset: selectedAsset, recipientName: recipient.name, type: 'phone' });
        setPhone(''); setAmount('');
      } else {
        alert('Недостаточно средств или ошибка перевода');
      }
    } else {
      if (!address || address.length < 26) { alert('Введите корректный адрес кошелька'); return; }
      
      // Mocking external crypto transfer
      const currentBalance = assets.find(a => a.coin === selectedAsset)?.balance || 0;
      if (val > currentBalance) { alert('Недостаточно средств'); return; }
      
      // Simulate success
      setTimeout(() => {
        setSuccessData({ amount: val, asset: selectedAsset, recipientName: `${address.slice(0, 6)}...${address.slice(-4)}`, type: 'address' });
        setAddress(''); setAmount('');
      }, 1000);
    }
  };

  if (successData) {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'var(--bg-dark)',
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(0, 212, 170, 0.15), transparent 60%)',
        zIndex: 1000,
        display: 'flex', flexDirection: 'column',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', padding: '24px' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(0, 212, 170, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: 56, height: 56, background: 'var(--success-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0, 212, 170, 0.4)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--bg-dark)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-secondary)' }}>Перевод отправлен</h2>
          <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
            {successData.amount} {successData.asset}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{successData.recipientName}</p>
        </div>

        <div style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--border-glass)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
          <button 
            style={{ width: '100%', padding: '16px', background: 'var(--success-color)', color: 'var(--bg-dark)', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 700, marginTop: '8px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 212, 170, 0.3)' }}
            onClick={() => { setSuccessData(null); navigateTo('home'); }}
          >
            В портфель
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigateTo('home')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 className="h2" style={{ margin: 0 }}>Отправить / Получить</h2>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-glass)', borderRadius: '16px', padding: '4px', border: '1px solid var(--border-glass)' }}>
        <button 
          onClick={() => setActiveTab('send')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', background: activeTab === 'send' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'send' ? 'var(--bg-dark)' : 'var(--text-secondary)' }}
        >
          Отправить
        </button>
        <button 
          onClick={() => setActiveTab('receive')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', background: activeTab === 'receive' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'receive' ? 'var(--bg-dark)' : 'var(--text-secondary)' }}
        >
          Получить
        </button>
      </div>

      {activeTab === 'send' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
          
          {/* Asset Selection */}
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Выберите актив</label>
            <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '10px' }}>
              {assets.map((asset) => (
                <button 
                  key={asset.coin} 
                  onClick={() => setSelectedAsset(asset.coin)}
                  style={{
                    minWidth: '140px',
                    padding: '14px',
                    borderRadius: '16px',
                    background: selectedAsset === asset.coin ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg-glass)',
                    border: selectedAsset === asset.coin ? '1.5px solid var(--accent-color)' : '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{asset.coin}</span>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: asset.color }}></div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Баланс: {Number(asset.balance).toFixed(asset.coin === 'wcT' ? 2 : 6)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Send Method Toggle */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <button onClick={() => setSendMethod('address')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid', borderColor: sendMethod === 'address' ? 'var(--accent-color)' : 'transparent', background: sendMethod === 'address' ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg-glass)', color: sendMethod === 'address' ? 'var(--accent-color)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>По адресу кошелька</button>
            <button onClick={() => setSendMethod('phone')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid', borderColor: sendMethod === 'phone' ? 'var(--accent-color)' : 'transparent', background: sendMethod === 'phone' ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg-glass)', color: sendMethod === 'phone' ? 'var(--accent-color)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>WaveCoin ID</button>
          </div>

          {/* Recipient Input */}
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              {sendMethod === 'phone' ? 'WaveCoin ID (Номер телефона)' : 'Адрес кошелька / ENS'}
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder={sendMethod === 'phone' ? "+7 (777) 000-00-00" : "0x..."} 
              value={sendMethod === 'phone' ? phone : address}
              onChange={(e) => sendMethod === 'phone' ? setPhone(e.target.value) : setAddress(e.target.value)}
              style={{ padding: '16px', fontSize: '15px' }}
            />
            {sendMethod === 'phone' && recipient && recipient.name && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-color)', fontSize: '14px', animation: 'fadeIn 0.3s ease-out' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Получатель: <b>{recipient.name}</b></span>
              </div>
            )}
            {sendMethod === 'address' && address.length > 20 && (
              <p style={{ fontSize: '12px', color: 'var(--warning-color)', marginTop: '8px' }}>Внимание: переводы в криптосетях необратимы. Проверьте сеть (ERC-20/BEP-20).</p>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Сумма ({selectedAsset})</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                className="input-field"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ padding: '16px', fontSize: '20px', fontWeight: 600 }}
              />
              <button 
                onClick={() => setAmount(String(assets.find(a => a.coin === selectedAsset)?.balance || 0))}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0, 212, 170, 0.2)', border: 'none', color: 'var(--accent-color)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >МАКС</button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Доступно: {Number(assets.find(a => a.coin === selectedAsset)?.balance || 0).toFixed(selectedAsset === 'wcT' ? 2 : 6)} {selectedAsset}
            </p>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '8px' }} onClick={handleSend}>
            Продолжить
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', animation: 'fadeIn 0.3s ease-out', padding: '16px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Ваш WaveCoin Адрес</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Используйте этот адрес или QR-код для пополнения вашего кошелька</p>
          </div>

          {/* Mock QR Code Container */}
          <div style={{ width: 240, height: 240, background: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(0, 212, 170, 0.15)', position: 'relative' }}>
            <div style={{ width: '85%', height: '85%', border: '4px dashed #0a0b0f', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0a0b0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
               <span style={{ color: '#0a0b0f', fontWeight: 700, fontSize: '14px' }}>WAVECOIN QR</span>
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 48, height: 48, background: 'var(--bg-dark)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
              <span style={{ color: 'var(--accent-color)', fontWeight: 800, fontSize: '20px' }}>W</span>
            </div>
          </div>

          {/* Address Box */}
          <div style={{ width: '100%', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Адрес (ERC-20/BEP-20)</p>
              <p style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                0x8F3c9b...A12d4E9f
              </p>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText('0x8F3c9b9875A12d4E9f'); alert('Адрес скопирован'); }}
              style={{ background: 'rgba(0, 212, 170, 0.15)', border: 'none', color: 'var(--accent-color)', width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
            Отправляйте только поддерживаемые активы в сети <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>WaveChain, ERC-20, BEP-20</span>.
          </p>
        </div>
      )}
    </div>
  );
}
