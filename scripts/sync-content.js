import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(rootDir, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const ENABLE_CONTENT_SYNC = process.env.ENABLE_CONTENT_SYNC !== "false";
const CONTENT_DIR = process.env.CONTENT_DIR
  ? path.resolve(rootDir, process.env.CONTENT_DIR)
  : path.join(rootDir, "content");
const CONTENT_REPO_URL = process.env.CONTENT_REPO_URL || "";
const CONTENT_SYNC_PULL = process.env.CONTENT_SYNC_PULL === "true";

const contentMappings = [
  { src: "posts", dest: "src/content/posts" },
  { src: "spec", dest: "src/content/spec" },
  { src: "data", dest: "src/data" },
  { src: "images", dest: "public/images" },
];

function quote(str) {
  return JSON.stringify(str);
}

function assertSafeDestination(destPath) {
  const resolved = path.resolve(destPath);
  const allowed = contentMappings.map((m) => path.resolve(rootDir, m.dest));
  if (!allowed.includes(resolved)) {
    throw new Error(`拒绝同步到非白名单目录: ${resolved}`);
  }
}

function syncRecursive(srcDir, destDir, preserveSet = new Set()) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const srcEntries = fs.readdirSync(srcDir, { withFileTypes: true });
  const srcNames = new Set(srcEntries.map((e) => e.name));

  const destEntries = fs.readdirSync(destDir, { withFileTypes: true });
  for (const entry of destEntries) {
    if (preserveSet.has(entry.name)) continue;
    if (!srcNames.has(entry.name)) {
      const targetPath = path.join(destDir, entry.name);
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  }

  for (const entry of srcEntries) {
    if (
      entry.name.startsWith(".git") ||
      entry.name === ".DS_Store" ||
      entry.name === "Thumbs.db"
    ) {
      continue;
    }
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      syncRecursive(srcPath, destPath, preserveSet);
    } else if (entry.isFile()) {
      if (fs.existsSync(destPath)) {
        const srcStat = fs.statSync(srcPath);
        const destStat = fs.statSync(destPath);
        if (srcStat.size === destStat.size) {
          const srcBuf = fs.readFileSync(srcPath);
          const destBuf = fs.readFileSync(destPath);
          if (srcBuf.equals(destBuf)) {
            continue;
          }
        }
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function prepareContentDir() {
  if (!fs.existsSync(CONTENT_DIR)) {
    if (!CONTENT_REPO_URL) {
      console.warn("[sync-content] 内容目录不存在且未配置 CONTENT_REPO_URL，跳过同步");
      return false;
    }
    console.log(`[sync-content] 克隆内容仓库: ${CONTENT_REPO_URL}`);
    execSync(`git clone --depth 1 ${quote(CONTENT_REPO_URL)} ${quote(CONTENT_DIR)}`, {
      stdio: "inherit",
      cwd: rootDir,
    });
    return true;
  }

  if (!fs.existsSync(path.join(CONTENT_DIR, ".git"))) {
    return true;
  }

  if (!CONTENT_SYNC_PULL) {
    console.log("[sync-content] 使用本地内容仓库，跳过远程 fetch");
    return true;
  }

  try {
    execSync("git fetch --all --prune", { cwd: CONTENT_DIR, stdio: "inherit" });
    let branch = "main";
    try {
      execSync("git rev-parse --verify origin/main", { cwd: CONTENT_DIR, stdio: "pipe" });
    } catch {
      branch = "master";
    }
    execSync(`git checkout ${quote(branch)}`, { cwd: CONTENT_DIR, stdio: "inherit" });
    execSync(`git reset --hard origin/${branch}`, { cwd: CONTENT_DIR, stdio: "inherit" });
  } catch (err) {
    console.error("[sync-content] 拉取远程内容仓库失败:", err.message);
    if (process.env.CI) {
      process.exit(1);
    }
  }
  return true;
}

function main() {
  if (!ENABLE_CONTENT_SYNC) {
    console.log("[sync-content] 内容同步已禁用 (ENABLE_CONTENT_SYNC=false)");
    return;
  }

  const ready = prepareContentDir();
  if (!ready) return;

  for (const m of contentMappings) {
    const srcPath = path.join(CONTENT_DIR, m.src);
    const destPath = path.join(rootDir, m.dest);

    assertSafeDestination(destPath);
    if (!fs.existsSync(srcPath)) {
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
        fs.mkdirSync(destPath, { recursive: true });
      }
      continue;
    }

    syncRecursive(srcPath, destPath, new Set(m.preserve || []));
    console.log(`[sync-content] 已同步: ${m.src} -> ${m.dest}`);
  }
}

main();
