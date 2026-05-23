const FESTIVALS = [
  { name: "New Year",          emoji: "🎊", discount: 30, start: [1,1],   end: [1,3]   },
  { name: "Pongal",            emoji: "🌾", discount: 25, start: [1,14],  end: [1,17]  },
  { name: "Republic Day",      emoji: "🇮🇳", discount: 26, start: [1,25],  end: [1,26]  },
  { name: "Holi",              emoji: "🎨", discount: 35, start: [3,24],  end: [3,26]  },
  { name: "Ugadi",             emoji: "🌺", discount: 30, start: [3,30],  end: [4,1]   },
  { name: "Eid",               emoji: "🌙", discount: 30, start: [4,10],  end: [4,12]  },
  { name: "Summer Sale",       emoji: "☀️", discount: 40, start: [5,1],   end: [5,31]  },
  { name: "Independence Day",  emoji: "🇮🇳", discount: 26, start: [8,14],  end: [8,16]  },
  { name: "Vema Birthday",     emoji: "🎂", discount: 90, start: [8,18],  end: [8,18]  },
  { name: "Ganesh Chaturthi",  emoji: "🐘", discount: 30, start: [9,7],   end: [9,10]  },
  { name: "Navratri",          emoji: "✨", discount: 35, start: [10,3],  end: [10,12] },
  { name: "Dussehra",          emoji: "🔥", discount: 35, start: [10,12], end: [10,13] },
  { name: "Diwali",            emoji: "🪔", discount: 40, start: [11,1],  end: [11,5]  },
  { name: "Black Friday",      emoji: "🛍️", discount: 50, start: [11,29], end: [11,30] },
  { name: "Christmas",         emoji: "🎄", discount: 25, start: [12,24], end: [12,26] },
  { name: "New Year Eve",      emoji: "🎆", discount: 30, start: [12,31], end: [12,31] },
]

export function getActiveFestival() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  for (const festival of FESTIVALS) {
    const [startMonth, startDay] = festival.start
    const [endMonth, endDay] = festival.end

    const afterStart = month > startMonth || (month === startMonth && day >= startDay)
    const beforeEnd = month < endMonth || (month === endMonth && day <= endDay)

    if (afterStart && beforeEnd) {
      return {
        ...festival,
        endDate: new Date(now.getFullYear(), endMonth - 1, endDay, 23, 59, 59)
      }
    }
  }
  return null
}

export function getDiscountedPrice(originalPrice, discountPercent) {
  return Math.round(originalPrice * (1 - discountPercent / 100))
}
