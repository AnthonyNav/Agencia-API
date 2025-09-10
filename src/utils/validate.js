export const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isFutureISO = s => {
  const d = new Date(`${s}T00:00:00`);
  const t = new Date(); t.setHours(0,0,0,0);
  return !Number.isNaN(+d) && d > t;
};
