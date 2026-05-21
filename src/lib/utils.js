export function formatPrice(cents) {
  return '$' + (cents / 100).toFixed(2);
}

export function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function formatOrderNumber(id) {
  return '#' + id.toString().padStart(5, '0');
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getDropLabel(drop) {
  if (!drop) return '';
  const type = drop.drop_type === 'sunday' ? 'Sunday' : 'Wednesday';
  return `${type} Drop — ${formatDateShort(drop.drop_date)}`;
}

export function getDeadlineCountdown(deadlineStr) {
  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffMs = deadline - now;

  if (diffMs <= 0) return null;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (diffDays > 0) {
    return `${diffDays}d ${remainingHours}h remaining`;
  }
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m remaining`;
  }
  return `${diffMins}m remaining`;
}
