const KEY = 'student-favorites';

export function getFavorites() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

export function toggleFavorite(type, id) {
  const favs = getFavorites();
  const list = favs[type] || [];
  const sid = String(id);
  favs[type] = list.includes(sid) ? list.filter(x => x !== sid) : [...list, sid];
  localStorage.setItem(KEY, JSON.stringify(favs));
  return favs[type].includes(sid);
}

export function isFavorited(type, id) {
  const favs = getFavorites();
  return (favs[type] || []).includes(String(id));
}
