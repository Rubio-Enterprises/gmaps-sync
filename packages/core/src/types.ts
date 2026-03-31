/** Simplified config — no profiles */
export interface SyncConfig {
  delayBetweenListsMs: [number, number];
  navigationTimeoutMs: number;
  maxConsecutiveFailures: number;
}

export interface EnrichmentConfig {
  reEnrichAfterDays: number;
}

export interface AppConfig {
  browserProfileDir: string;
  sync: SyncConfig;
  headless: boolean;
  useSystemChrome: boolean;
  snapshotsRetentionDays: number;
  enrichment: EnrichmentConfig;
}

/** Raw parsed data from the scraper before diff processing */
export interface ParsedList {
  id: string | null;
  name: string;
  type: number;
  count: number;
}

export interface ParsedPlace {
  name: string;
  lat: number;
  lng: number;
  address: string;
  comment: string | null;
  placeId: string;
  placeRef: string | null;
}
