import type { NextConfig } from "next";

// This app is a git submodule that is also a root npm workspace, so its deps
// (e.g. tailwindcss) live in `frontend/node_modules`, not the monorepo root.
// Pin the project root to this directory so both Turbopack and webpack resolve
// modules and trace files from here instead of inferring the outer repo root.
const projectRoot = import.meta.dirname;

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot
  },
  outputFileTracingRoot: projectRoot
};

export default nextConfig;
