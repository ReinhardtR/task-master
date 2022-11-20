// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */
const { env } = require("./server/env");

/**
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function getConfig(config) {
  return config;
}

module.exports = getConfig({
  experimental: {
    appDir: true,
  },
  publicRuntimeConfig: {
    NODE_ENV: env.NODE_ENV,
  },
});
