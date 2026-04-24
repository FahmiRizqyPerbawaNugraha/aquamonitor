export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(val, decimals = 2) {
  if (val === null || val === undefined) return '-';
  return Number(val).toFixed(decimals);
}

export function dssColor(result) {
  const colors = {
    sangat_baik: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/30' },
    baik: { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30' },
    cukup_baik: { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-100 dark:bg-amber-900/30' },
    kurang_baik: { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30' },
    buruk: { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-100 dark:bg-red-900/30' },
  };
  return colors[result] || colors.baik;
}

export function dssLabel(result) {
  const labels = {
    sangat_baik: 'Sangat Baik',
    baik: 'Baik',
    cukup_baik: 'Cukup Baik',
    kurang_baik: 'Kurang Baik',
    buruk: 'Buruk',
  };
  return labels[result] || result;
}

export function sensorIcon(name) {
  const icons = {
    ph: '🧪',
    suhu: '🌡️',
    do: '💧',
    tds: '🔬',
  };
  return icons[name?.toLowerCase()] || '📊';
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
