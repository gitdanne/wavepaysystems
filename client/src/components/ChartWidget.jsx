import { useEffect, useRef, useState, useContext } from 'react';
import { createChart } from 'lightweight-charts';
import { BankContext } from '../state/BankContext';

export default function ChartWidget({ coinSymbol }) {
  const chartContainerRef = useRef();
  const { fiatCurrency, fiatRateToUsd } = useContext(BankContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Fetch data from Binance
    const fetchKlines = async () => {
      try {
        setLoading(true);
        // Map coin to Binance symbol, default to USDT pair
        const symbol = `${coinSymbol}USDT`;
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`);
        const data = await res.json();
        
        // Binance klines format: [ Open time, Open, High, Low, Close, Volume, Close time, ... ]
        const formattedData = data.map(d => ({
          time: d[0] / 1000, // Unix timestamp in seconds
          open: parseFloat(d[1]) * fiatRateToUsd,
          high: parseFloat(d[2]) * fiatRateToUsd,
          low: parseFloat(d[3]) * fiatRateToUsd,
          close: parseFloat(d[4]) * fiatRateToUsd,
        }));

        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: 'solid', color: 'transparent' },
            textColor: 'rgba(255, 255, 255, 0.5)',
          },
          grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
          },
          rightPriceScale: {
            borderVisible: false,
            scaleMargins: { top: 0.1, bottom: 0.1 },
          },
          timeScale: {
            borderVisible: false,
            timeVisible: true,
            secondsVisible: false,
          },
          crosshair: {
            mode: 0,
            vertLine: {
              color: 'rgba(255, 255, 255, 0.2)',
              style: 0,
            },
            horzLine: {
              color: 'rgba(255, 255, 255, 0.2)',
              style: 0,
            },
          },
          height: 250,
        });

        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#00e676',
          downColor: '#ff4757',
          borderVisible: false,
          wickUpColor: '#00e676',
          wickDownColor: '#ff4757',
        });

        candlestickSeries.setData(formattedData);
        chart.timeScale().fitContent();
        setLoading(false);

        const handleResize = () => {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
        };
      } catch (err) {
        console.error('Failed to load chart data', err);
        setLoading(false);
      }
    };

    const cleanup = fetchKlines();
    return () => {
      cleanup.then(cleanupFn => {
        if (typeof cleanupFn === 'function') cleanupFn();
      });
    };
  }, [coinSymbol, fiatRateToUsd]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '250px' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ width: 24, height: 24, border: '2px solid rgba(0, 212, 170, 0.2)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%', opacity: loading ? 0 : 1, transition: 'opacity 0.3s ease' }} />
    </div>
  );
}
