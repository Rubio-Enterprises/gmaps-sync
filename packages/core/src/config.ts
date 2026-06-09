import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { AppConfig } from "./types.js";

const TOOL = "gmaps-sync";

// XDG Base Directory roots — each honors its env var with a spec-compliant fallback.
const DATA_DIR = process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"); // valuable, survives reboots (SQLite DB)
const CONFIG_DIR = process.env.XDG_CONFIG_HOME || join(homedir(), ".config"); // user-editable settings
const STATE_DIR = process.env.XDG_STATE_HOME || join(homedir(), ".local", "state"); // session profile + snapshots

// Per-kind tool directories.
export const GMAPS_DATA_DIR = join(DATA_DIR, TOOL);
export const GMAPS_CONFIG_DIR = join(CONFIG_DIR, TOOL);
export const GMAPS_STATE_DIR = join(STATE_DIR, TOOL);

export const DB_PATH = join(GMAPS_DATA_DIR, "places.db");
export const CONFIG_PATH = join(GMAPS_CONFIG_DIR, "config.json");
export const SNAPSHOTS_DIR = join(GMAPS_STATE_DIR, "snapshots");

// Legacy single-root location, pre-XDG.
const LEGACY_DIR = join(homedir(), ".gmaps-sync");

/**
 * One-time, idempotent migration of the pre-XDG `~/.gmaps-sync` directory into
 * the per-kind XDG locations. Each entry is moved only if the destination does
 * not already exist, so re-running is safe and never clobbers newer data.
 */
export function migrateLegacyDir(): void {
  if (!existsSync(LEGACY_DIR)) {
    return;
  }

  // (legacy basename, destination path, destination parent)
  const moves: Array<[string, string, string]> = [
    ["places.db", DB_PATH, GMAPS_DATA_DIR],
    ["places.db-wal", join(GMAPS_DATA_DIR, "places.db-wal"), GMAPS_DATA_DIR],
    ["places.db-shm", join(GMAPS_DATA_DIR, "places.db-shm"), GMAPS_DATA_DIR],
    ["config.json", CONFIG_PATH, GMAPS_CONFIG_DIR],
    ["browser", join(GMAPS_STATE_DIR, "browser"), GMAPS_STATE_DIR],
    ["snapshots", SNAPSHOTS_DIR, GMAPS_STATE_DIR],
  ];

  let migrated = false;
  for (const [name, dest, destParent] of moves) {
    const src = join(LEGACY_DIR, name);
    if (existsSync(src) && !existsSync(dest)) {
      mkdirSync(destParent, { recursive: true });
      renameSync(src, dest);
      migrated = true;
    }
  }

  if (migrated) {
    // console.warn (allowed by the noConsole rule) — a one-time migration notice.
    console.warn(`Migrated legacy ${LEGACY_DIR} into XDG directories:`);
    console.warn(`  data:   ${GMAPS_DATA_DIR}`);
    console.warn(`  config: ${GMAPS_CONFIG_DIR}`);
    console.warn(`  state:  ${GMAPS_STATE_DIR}`);
    // Best-effort cleanup: remove the legacy dir only once it is empty.
    try {
      if (readdirSync(LEGACY_DIR).length === 0) {
        renameSync(LEGACY_DIR, `${LEGACY_DIR}.migrated`);
        console.warn(`  legacy dir emptied; renamed to ${LEGACY_DIR}.migrated`);
      }
    } catch {
      // Non-fatal: leftover legacy contents are harmless and re-checked next run.
    }
  }
}

export const DEFAULT_CONFIG: AppConfig = {
  browserProfileDir: join(GMAPS_STATE_DIR, "browser"),
  sync: {
    delayBetweenListsMs: [2000, 5000],
    navigationTimeoutMs: 30000,
    maxConsecutiveFailures: 2,
  },
  headless: true,
  useSystemChrome: true,
  snapshotsRetentionDays: 30,
  enrichment: {
    reEnrichAfterDays: 30,
  },
};

export function loadConfig(configPath?: string): AppConfig {
  const path = configPath ?? CONFIG_PATH;
  if (!existsSync(path)) {
    return { ...DEFAULT_CONFIG };
  }

  const raw = readFileSync(path, "utf-8");
  const partial = JSON.parse(raw) as Partial<AppConfig>;

  return {
    ...DEFAULT_CONFIG,
    ...partial,
    sync: { ...DEFAULT_CONFIG.sync, ...partial.sync },
    enrichment: { ...DEFAULT_CONFIG.enrichment, ...partial.enrichment },
  };
}
