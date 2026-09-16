import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const runtimeRoot = process.env.SITES_RUNTIME_ROOT || path.join(projectRoot, ".sites-runtime");

for (const child of [
  "home",
  "npm-cache",
  "xdg-config",
  "tmp",
  path.join("wrangler", "logs"),
  path.join("wrangler", "registry"),
]) {
  fs.mkdirSync(path.join(runtimeRoot, child), { recursive: true });
}

const homeDir = path.join(runtimeRoot, "home");
const cacheDir = path.join(runtimeRoot, "npm-cache");
const xdgDir = path.join(runtimeRoot, "xdg-config");
const tmpDir = path.join(runtimeRoot, "tmp");
const logPath = path.join(runtimeRoot, "wrangler", "logs");

const env = {
  ...process.env,
  SITES_ENV_READY: "1",
  SITES_PROJECT_ROOT: projectRoot,
  HOME: homeDir,
  XDG_CONFIG_HOME: xdgDir,
  TMPDIR: tmpDir,
  WRANGLER_WRITE_LOGS: "false",
  WRANGLER_LOG_PATH: logPath,
  MINIFLARE_REGISTRY_PATH: path.join(runtimeRoot, "wrangler", "registry"),
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

const localBin = path.join(projectRoot, "node_modules", ".bin");
env.PATH = `${localBin}${path.delimiter}${env.PATH || ""}`;

const args = [...process.argv.slice(2)];
if (args[0] === "--") {
  args.shift();
}

if (args.length === 0) {
  console.error("usage: node scripts/sites-env.js -- command [args...]");
  process.exit(64);
}

const [command, ...commandArgs] = args;
const result = spawnSync(command, commandArgs, {
  cwd: projectRoot,
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
