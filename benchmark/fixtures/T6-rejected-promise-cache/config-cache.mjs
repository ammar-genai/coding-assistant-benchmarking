function normalizeTenantId(value) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError("tenantId must be a non-empty string");
  }

  return value.trim();
}

function normalizeConfig(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("origin returned an invalid config");
  }
  if (typeof value.version !== "string" || value.version.trim() === "") {
    throw new TypeError("origin config version must be a non-empty string");
  }
  if (!Array.isArray(value.features) || value.features.some((feature) => typeof feature !== "string")) {
    throw new TypeError("origin config features must be an array of strings");
  }

  return {
    version: value.version,
    features: [...value.features],
  };
}

function copyConfig(config) {
  return {
    version: config.version,
    features: [...config.features],
  };
}

export class ConfigOriginError extends Error {
  constructor(message = "Config origin unavailable", options = {}) {
    super(message, options);
    this.name = "ConfigOriginError";
  }
}

export function createConfigCache(loadFromOrigin) {
  if (typeof loadFromOrigin !== "function") {
    throw new TypeError("loadFromOrigin must be a function");
  }

  const entries = new Map();

  async function getConfig(tenantId) {
    const key = normalizeTenantId(tenantId);
    let pending = entries.get(key);

    if (!pending) {
      pending = Promise.resolve()
        .then(() => loadFromOrigin(key))
        .then(normalizeConfig);
      entries.set(key, pending);
    }

    return copyConfig(await pending);
  }

  function clear(tenantId) {
    if (arguments.length === 0) {
      entries.clear();
      return;
    }

    entries.delete(normalizeTenantId(tenantId));
  }

  return {
    getConfig,
    clear,
    size: () => entries.size,
  };
}
