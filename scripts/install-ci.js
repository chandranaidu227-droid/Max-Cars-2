import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const runtimeRoot = path.join(projectRoot, ".sites-runtime");
const homeDir = path.join(runtimeRoot, "home");
const cacheDir = path.join(runtimeRoot, "npm-cache");
const xdgDir = path.join(runtimeRoot, "xdg-config");
const tmpDir = path.join(runtimeRoot, "tmp");
const logDir = path.join(runtimeRoot, "wrangler", "logs");
const registryDir = path.join(runtimeRoot, "wrangler", "registry");

for (const dir of [homeDir, cacheDir, xdgDir, tmpDir, logDir, registryDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const env = {
  ...process.env,
  SITES_ENV_READY: "1",
  SITES_PROJECT_ROOT: projectRoot,
  HOME: homeDir,
  XDG_CONFIG_HOME: xdgDir,
  TMPDIR: tmpDir,
  WRANGLER_WRITE_LOGS: "false",
  WRANGLER_LOG_PATH: logDir,
  MINIFLARE_REGISTRY_PATH: registryDir,
  npm_config_cache: cacheDir,
  npm_config_audit: "false",
  npm_config_fund: "false",
  npm_config_update_notifier: "false",
};

for (const key of [
  "NPM_CONFIG_CACHE",
  "npm_config_proxy",
  "npm_config_http_proxy",
  "npm_config_https_proxy",
  "NPM_CONFIG_PROXY",
  "NPM_CONFIG_HTTP_PROXY",
  "NPM_CONFIG_HTTPS_PROXY",
]) {
  delete env[key];
}

const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["ci", "--cache", cacheDir], {
  cwd: projectRoot,
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
