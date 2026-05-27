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
  pro: {
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
  max: {
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
  enterprise: {
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
  spark:      "Spark",
  build:      "Build",
  pro:        "Pro",
  max:        "Max",
  enterprise: "Enterprise",
}

export const PLAN_PRICES = {
  spark:      { monthly: 0,     annual: 0      },
  build:      { monthly: 2000,  annual: 20000  },
  pro:        { monthly: 5000,  annual: 50000  },
  max:        { monthly: 10000, annual: 100000 },
  enterprise: { monthly: 20000, annual: 200000 },
}

export const KINET_MODELS = {
  spark:      "Kinet",
  build:      "Kinet Pro",
  pro:        "Kinet Max",
  max:        "Kaizen 4",
  enterprise: "Kaizen 4 Enterprise",
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
