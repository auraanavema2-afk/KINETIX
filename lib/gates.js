const PLAN_FEATURES = {
  spark: {
    messages: 50,
    projects: 3,
    agents: 0,
    studioBuilds: 3,
    deployments: 1,
    structuredThinking: false,
    codeExport: false,
    customDomain: false,
    whiteLabel: false,
  },
  build: {
    messages: 500,
    projects: Infinity,
    agents: 5,
    studioBuilds: 15,
    deployments: 5,
    structuredThinking: true,
    codeExport: true,
    customDomain: false,
    whiteLabel: false,
  },
  launch: {
    messages: Infinity,
    projects: Infinity,
    agents: 25,
    studioBuilds: Infinity,
    deployments: 25,
    structuredThinking: true,
    codeExport: true,
    customDomain: true,
    whiteLabel: false,
  },
  scale: {
    messages: Infinity,
    projects: Infinity,
    agents: Infinity,
    studioBuilds: Infinity,
    deployments: Infinity,
    structuredThinking: true,
    codeExport: true,
    customDomain: true,
    whiteLabel: true,
  },
  conquer: {
    messages: Infinity,
    projects: Infinity,
    agents: Infinity,
    studioBuilds: Infinity,
    deployments: Infinity,
    structuredThinking: true,
    codeExport: true,
    customDomain: true,
    whiteLabel: true,
  },
}

export const PLAN_NAMES = {
  spark: "Spark",
  build: "Build",
  launch: "Launch",
  scale: "Scale",
  conquer: "Conquer",
}

export const PLAN_PRICES = {
  spark:   { monthly: 0,     annual: 0      },
  build:   { monthly: 1999,  annual: 19990  },
  launch:  { monthly: 4999,  annual: 49990  },
  scale:   { monthly: 9999,  annual: 99990  },
  conquer: { monthly: 19999, annual: 199990 },
}

export const KINET_MODELS = {
  spark:   "Kinet",
  build:   "Kinet Pro",
  launch:  "Kinet Max",
  scale:   "Kinet 4",
  conquer: "Kinet 4 Enterprise",
}

export function canUseFeature(plan, feature) {
  const planFeatures = PLAN_FEATURES[plan] || PLAN_FEATURES.spark
  return planFeatures[feature]
}

export function checkLimit(plan, feature, currentCount) {
  const limit = canUseFeature(plan, feature)
  if (limit === Infinity) return true
  if (typeof limit === "boolean") return limit
  return currentCount < limit
}

export function getLimit(plan, feature) {
  return PLAN_FEATURES[plan]?.[feature] ?? PLAN_FEATURES.spark[feature]
}
