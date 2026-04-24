import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../../contexts/ThemeContext';

export default function TimeSeriesChart({ series, title, unit, thresholdMin, thresholdMax, height = 300 }) {
  const { dark } = useTheme();

  const options = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: true },
      background: 'transparent',
      fontFamily: 'DM Sans, sans-serif',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 600,
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: { colors: dark ? '#64748b' : '#94a3b8', fontSize: '11px' },
        datetimeFormatter: { hour: 'HH:mm', day: 'dd MMM' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: unit || '', style: { color: dark ? '#64748b' : '#94a3b8', fontSize: '12px' } },
      labels: {
        style: { colors: dark ? '#64748b' : '#94a3b8', fontSize: '11px' },
        formatter: (val) => val?.toFixed(1),
      },
    },
    tooltip: {
      x: { format: 'dd MMM yyyy HH:mm' },
      theme: dark ? 'dark' : 'light',
    },
    grid: {
      borderColor: dark ? '#1e293b' : '#f1f5f9',
      strokeDashArray: 4,
    },
    colors: ['#06b6d4'],
    annotations: {
      yaxis: thresholdMin !== undefined && thresholdMax !== undefined ? [
        {
          y: thresholdMin,
          y2: thresholdMax,
          fillColor: '#06b6d4',
          opacity: 0.08,
          label: {
            text: 'Batas Normal',
            position: 'front',
            style: { color: '#06b6d4', background: 'transparent', fontSize: '10px' },
          },
        },
      ] : [],
    },
  };

  return (
    <div className="card p-4">
      {title && <h4 className="text-sm font-semibold mb-3">{title}</h4>}
      <ReactApexChart options={options} series={series} type="area" height={height} />
    </div>
  );
}
