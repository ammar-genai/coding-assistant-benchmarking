import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";
const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: isGitHubPagesBuild ? "export" : undefined,
  trailingSlash: isGitHubPagesBuild,
  basePath: isGitHubPagesBuild ? pagesBasePath : undefined,
  assetPrefix: isGitHubPagesBuild ? pagesBasePath : undefined,
  images: {
    unoptimized: isGitHubPagesBuild,
  },
};

export default nextConfig;
