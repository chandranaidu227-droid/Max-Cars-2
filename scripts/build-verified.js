import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const vinextBin = path.join(projectRoot, "node_modules", ".bin", process.platform === "win32" ? "vinext.cmd" : "vinext");

if (!fs.existsSync(vinextBin)) {
  console.error("vinext is unavailable. Run npm run install:ci and wait for it to finish before building.");
  process.exit(69);
}

const env = { ...process.env, SITES_ENV_READY: "1" };
const result = spawnSync(vinextBin, ["build"], {
  cwd: projectRoot,
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
