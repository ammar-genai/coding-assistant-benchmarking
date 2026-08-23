import { ConfigOriginError } from "./config-cache.mjs";

const JSON_HEADERS = Object.freeze({
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
});

function response(status, body, extraHeaders = {}) {
  return {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
    body,
  };
}

function tenantFromUrl(url) {
  if (typeof url !== "string") {
    return null;
  }

  const match = /^\/api\/config\/([^/?#]+)$/.exec(url);
  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function createConfigApi(cache) {
  if (!cache || typeof cache.getConfig !== "function") {
    throw new TypeError("cache must expose getConfig");
  }

  return async function handleConfigRequest(request) {
    if (!request || typeof request !== "object") {
      return response(400, { error: "invalid_request" });
    }

    const tenantId = tenantFromUrl(request.url);
    if (tenantId === null) {
      return response(404, { error: "not_found" });
    }
    if (request.method !== "GET") {
      return response(405, { error: "method_not_allowed" }, { allow: "GET" });
    }

    try {
      return response(200, { config: await cache.getConfig(tenantId) });
    } catch (error) {
      if (error instanceof ConfigOriginError) {
        return response(
          503,
          { error: "config_origin_unavailable" },
          { "retry-after": "1" },
        );
      }
      if (error instanceof TypeError && /tenantId/.test(error.message)) {
        return response(400, { error: "invalid_tenant" });
      }

      return response(500, { error: "config_unavailable" });
    }
  };
}
