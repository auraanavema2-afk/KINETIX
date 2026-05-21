export const PLANS = {
  spark: "spark",
  pro: "pro",
  elite: "elite",
};

export const FEATURES = {
  SOUL_MEMORY: "soul_memory",
  UNLIMITED_PROJECTS: "unlimited_projects",
  AI_STUDIO: "ai_studio",
  UNIVERSE_VIEW: "universe_view",
  PULSE_ANALYTICS: "pulse_analytics",
  EXPORT: "export",
  PRIORITY_AI: "priority_ai",
  CUSTOM_AI_MODEL: "custom_ai_model",
  TEAM_COLLAB: "team_collab",
  API_ACCESS: "api_access",
};

const PLAN_LIMITS = {
  [PLANS.spark]: {
    projects: 3,
    conversationsPerDay: 10,
    storageGB: 0.5,
  },
  [PLANS.pro]: {
    projects: 50,
    conversationsPerDay: 200,
    storageGB: 10,
  },
  [PLANS.elite]: {
    projects: Infinity,
    conversationsPerDay: Infinity,
    storageGB: 100,
  },
};

const FEATURE_GATES = {
  [FEATURES.SOUL_MEMORY]: [PLANS.pro, PLANS.elite],
  [FEATURES.UNLIMITED_PROJECTS]: [PLANS.elite],
  [FEATURES.AI_STUDIO]: [PLANS.pro, PLANS.elite],
  [FEATURES.UNIVERSE_VIEW]: [PLANS.pro, PLANS.elite],
  [FEATURES.PULSE_ANALYTICS]: [PLANS.pro, PLANS.elite],
  [FEATURES.EXPORT]: [PLANS.pro, PLANS.elite],
  [FEATURES.PRIORITY_AI]: [PLANS.elite],
  [FEATURES.CUSTOM_AI_MODEL]: [PLANS.elite],
  [FEATURES.TEAM_COLLAB]: [PLANS.elite],
  [FEATURES.API_ACCESS]: [PLANS.elite],
};

export function hasFeature(plan, feature) {
  const allowed = FEATURE_GATES[feature];
  if (!allowed) return true;
  return allowed.includes(plan);
}

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS[PLANS.spark];
}

export function canCreateProject(plan, currentCount) {
  const limits = getPlanLimits(plan);
  return currentCount < limits.projects;
}

export function isPro(plan) {
  return plan === PLANS.pro || plan === PLANS.elite;
}

export function isElite(plan) {
  return plan === PLANS.elite;
}

export function isSpark(plan) {
  return plan === PLANS.spark;
}
