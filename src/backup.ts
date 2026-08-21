import type { App, DataAdapter } from "obsidian";
import { PLUGIN_ID } from "./constants";
import { t } from "./i18n";
import type { BackupRecord } from "./types";

const META_FILE = "backup.json";

function backupsRoot(app: App): string {
  return `${app.vault.configDir}/plugins/${PLUGIN_ID}/backups`;
}

export function encodeBackupKey(key: string): string {
  return key.replace(/[^A-Za-z0-9._-]+/g, "_");
}

export function backupFolder(app: App, key: string): string {
  return `${backupsRoot(app)}/${encodeBackupKey(key)}`;
}

async function ensureDir(adapter: DataAdapter, dir: string): Promise<void> {
  if (await adapter.exists(dir)) return;
  const parent = dir.replace(/\\/g, "/").replace(/\/[^/]+$/, "");
  if (parent && parent !== dir) {
    await ensureDir(adapter, parent);
  }
  await adapter.mkdir(dir);
}

async function readIfExists(adapter: DataAdapter, path: string): Promise<string | null> {
  try {
    if (!(await adapter.exists(path))) return null;
    return await adapter.read(path);
  } catch {
    return null;
  }
}

export async function saveBackup(
  app: App,
  record: Omit<BackupRecord, "savedAt" | "files">,
  sourceDir: string,
  fileNames: string[]
): Promise<BackupRecord | null> {
  const adapter = app.vault.adapter;
  const copied: string[] = [];
  const contents: Array<{ name: string; data: string }> = [];
  for (const name of fileNames) {
    const data = await readIfExists(adapter, `${sourceDir}/${name}`);
    if (data == null) continue;
    copied.push(name);
    contents.push({ name, data });
  }
  if (!copied.length) return null;

  const dir = backupFolder(app, record.key);
  await ensureDir(adapter, dir);
  for (const file of contents) {
    await adapter.write(`${dir}/${file.name}`, file.data);
  }
  const meta: BackupRecord = {
    ...record,
    files: copied,
    savedAt: new Date().toISOString(),
  };
  await adapter.write(`${dir}/${META_FILE}`, JSON.stringify(meta, null, 2));
  return meta;
}

export async function readBackupMeta(
  app: App,
  key: string
): Promise<BackupRecord | null> {
  const adapter = app.vault.adapter;
  const raw = await readIfExists(adapter, `${backupFolder(app, key)}/${META_FILE}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BackupRecord;
    if (!parsed || typeof parsed !== "object" || !parsed.key) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function listBackups(app: App): Promise<BackupRecord[]> {
  const adapter = app.vault.adapter;
  const root = backupsRoot(app);
  if (!(await adapter.exists(root))) return [];
  let folders: string[] = [];
  try {
    const listed = await adapter.list(root);
    folders = listed.folders || [];
  } catch {
    return [];
  }
  const out: BackupRecord[] = [];
  for (const folder of folders) {
    const raw = await readIfExists(adapter, `${folder}/${META_FILE}`);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as BackupRecord;
      if (parsed && parsed.key) out.push(parsed);
    } catch {
      /* skip */
    }
  }
  out.sort((a, b) => String(b.savedAt || "").localeCompare(String(a.savedAt || "")));
  return out;
}

export async function restoreBackup(app: App, key: string): Promise<BackupRecord> {
  const adapter = app.vault.adapter;
  const meta = await readBackupMeta(app, key);
  if (!meta || !meta.files.length) {
    throw new Error(t("noBackup"));
  }
  const dir = backupFolder(app, key);
  if (!(await adapter.exists(meta.destDir))) {
    await ensureDir(adapter, meta.destDir);
  }
  for (const name of meta.files) {
    const data = await readIfExists(adapter, `${dir}/${name}`);
    if (data == null) continue;
    await adapter.write(`${meta.destDir}/${name}`, data);
  }
  return meta;
}
