import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function ChartCanvas({ type, data, options, height = 220 }) {
  const ref = useRef(null);
  const key = JSON.stringify(data) + JSON.stringify(options || {});
  useEffect(() => {
    const chart = new Chart(ref.current, {
      type,
      data,
      options: { responsive: true, maintainAspectRatio: false, ...options },
    });
    return () => chart.destroy();
  }, [type, key]); // eslint-disable-line
  return <div className="chart-wrap" style={{ height }}><canvas ref={ref} /></div>;
}
