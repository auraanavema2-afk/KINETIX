const FESTIVALS = [
  {
    id: "diwali",
    name: "Diwali",
    discount: 30,
    code: "DIWALI30",
    windows: [
      { start: new Date("2025-10-20"), end: new Date("2025-10-24") },
      { start: new Date("2026-11-08"), end: new Date("2026-11-12") },
    ],
  },
  {
    id: "new_year",
    name: "New Year",
    discount: 20,
    code: "NEWYEAR20",
    windows: [
      { start: new Date("2025-12-28"), end: new Date("2026-01-03") },
      { start: new Date("2026-12-28"), end: new Date("2027-01-03") },
    ],
  },
  {
    id: "independence_day",
    name: "Independence Day",
    discount: 15,
    code: "INDIA15",
    windows: [
      { start: new Date("2025-08-13"), end: new Date("2025-08-16") },
      { start: new Date("2026-08-13"), end: new Date("2026-08-16") },
    ],
  },
  {
    id: "holi",
    name: "Holi",
    discount: 25,
    code: "HOLI25",
    windows: [
      { start: new Date("2026-03-03"), end: new Date("2026-03-05") },
    ],
  },
  {
    id: "black_friday",
    name: "Black Friday",
    discount: 40,
    code: "BLACKFRIDAY40",
    windows: [
      { start: new Date("2025-11-28"), end: new Date("2025-12-02") },
      { start: new Date("2026-11-27"), end: new Date("2026-12-01") },
    ],
  },
];

function isWindowActive(window, now = new Date()) {
  return now >= window.start && now <= window.end;
}

export function isFestivalActive(festivalId, now = new Date()) {
  const festival = FESTIVALS.find((f) => f.id === festivalId);
  if (!festival) return false;
  return festival.windows.some((w) => isWindowActive(w, now));
}

export function getActiveFestivals(now = new Date()) {
  return FESTIVALS.filter((f) => f.windows.some((w) => isWindowActive(w, now)));
}

export function getFestivalDiscount(festivalId) {
  const festival = FESTIVALS.find((f) => f.id === festivalId);
  return festival ? { discount: festival.discount, code: festival.code } : null;
}

export function getBestActiveDiscount(now = new Date()) {
  const active = getActiveFestivals(now);
  if (!active.length) return null;
  return active.reduce((best, f) => (f.discount > best.discount ? f : best));
}

export { FESTIVALS };
