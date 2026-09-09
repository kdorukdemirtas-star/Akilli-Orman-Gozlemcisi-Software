import { accountStoreKey, readKip, readThreads } from "./chatStore.js";
import { readCoatRenewed } from "./coatCycle.js";
import { readConsent } from "./consentStore.js";
import { readDevice } from "./deviceStore.js";
import { readPlugins } from "./pluginStore.js";

const THREAD_KEY = "aog-chat-threads-v1";
const KIP_KEY = "aog-chat-kip-v1";

export function exportPersonalData(userId) {
  return {
    exportedAt: new Date().toISOString(),
    userId: String(userId || ""),
    threads: readThreads(userId),
    kip: readKip(userId),
    plugins: readPlugins(),
    device: readDevice(),
    coatRenewed: readCoatRenewed(),
    consent: readConsent(),
  };
}

export function wipePersonalData(userId) {
  const keys = [accountStoreKey(THREAD_KEY, userId), accountStoreKey(KIP_KEY, userId)];
  for (const key of keys) {
    if (!key) continue;
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
