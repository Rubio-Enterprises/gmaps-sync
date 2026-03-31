import type Database from "better-sqlite3";

export function runMigrations(sqlite: Database.Database): void {
  sqlite.pragma("foreign_keys = ON");

  const hasPlaces = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='places'")
    .get();

  if (hasPlaces) return;

  const ddl = [
    `CREATE TABLE places (
      google_place_id    TEXT PRIMARY KEY,
      legacy_id          TEXT UNIQUE,
      name               TEXT NOT NULL,
      lat                REAL NOT NULL,
      lng                REAL NOT NULL,
      address            TEXT NOT NULL DEFAULT '',
      comment            TEXT,
      content_hash       TEXT NOT NULL,
      created_at         TEXT NOT NULL,
      updated_at         TEXT NOT NULL,
      rating             REAL,
      user_rating_count  INTEGER,
      price_level        INTEGER,
      primary_type       TEXT,
      types              TEXT,
      editorial_summary  TEXT,
      reviews_text       TEXT,
      generative_summary TEXT,
      serves_breakfast   INTEGER,
      serves_lunch       INTEGER,
      serves_dinner      INTEGER,
      serves_brunch      INTEGER,
      serves_beer        INTEGER,
      serves_wine        INTEGER,
      serves_cocktails   INTEGER,
      serves_coffee      INTEGER,
      serves_dessert     INTEGER,
      serves_vegetarian_food INTEGER,
      outdoor_seating    INTEGER,
      live_music         INTEGER,
      good_for_children  INTEGER,
      good_for_groups    INTEGER,
      allows_dogs        INTEGER,
      dine_in            INTEGER,
      delivery           INTEGER,
      takeout            INTEGER,
      business_status    TEXT,
      website_uri        TEXT,
      phone_number       TEXT,
      enriched_at        TEXT,
      embedded_at        TEXT
    )`,
    `CREATE TABLE lists (
      id                 TEXT PRIMARY KEY,
      name               TEXT NOT NULL,
      type               INTEGER NOT NULL,
      last_seen_remote   TEXT,
      removed_remote     INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE place_lists (
      google_place_id    TEXT NOT NULL REFERENCES places(google_place_id),
      list_id            TEXT NOT NULL REFERENCES lists(id),
      PRIMARY KEY (google_place_id, list_id)
    )`,
    `CREATE TABLE sync_metadata (
      google_place_id    TEXT PRIMARY KEY REFERENCES places(google_place_id),
      source             TEXT NOT NULL DEFAULT 'pull',
      first_seen         TEXT NOT NULL,
      last_seen_remote   TEXT,
      removed_remote     INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE discovery_metadata (
      google_place_id    TEXT PRIMARY KEY REFERENCES places(google_place_id),
      discovered_at      TEXT NOT NULL,
      discovery_query    TEXT,
      discovery_lat      REAL,
      discovery_lng      REAL,
      discovery_radius   INTEGER
    )`,
    `CREATE TABLE sync_state (
      id                     INTEGER PRIMARY KEY DEFAULT 1,
      last_pull              TEXT,
      last_pull_status       TEXT CHECK (last_pull_status IN ('success', 'partial', 'failure')),
      schema_version         INTEGER NOT NULL DEFAULT 1,
      consecutive_failures   INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE pending_mutations (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      type          TEXT NOT NULL CHECK (type IN (
                        'add_place_to_list',
                        'remove_place_from_list',
                        'move_place_between_lists',
                        'rename_list',
                        'create_list',
                        'delete_list'
                    )),
      status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                        'pending', 'in_progress', 'pushed', 'failed'
                    )),
      place_id      TEXT,
      list_id       TEXT,
      payload       TEXT NOT NULL DEFAULT '{}',
      group_id      TEXT,
      seq           INTEGER NOT NULL DEFAULT 0,
      retry_count   INTEGER NOT NULL DEFAULT 0,
      max_retries   INTEGER NOT NULL DEFAULT 3,
      last_error    TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL,
      pushed_at     TEXT
    )`,
    `CREATE INDEX idx_pending_mutations_place_status
        ON pending_mutations (place_id, status)
        WHERE place_id IS NOT NULL AND status IN ('pending', 'in_progress')`,
    `CREATE INDEX idx_pending_mutations_status
        ON pending_mutations (status, created_at)`,
    `CREATE INDEX idx_pending_mutations_group
        ON pending_mutations (group_id, seq)
        WHERE group_id IS NOT NULL AND status = 'pending'`,
    `CREATE INDEX idx_pending_mutations_list
        ON pending_mutations (list_id, status)
        WHERE list_id IS NOT NULL`,
    `CREATE VIRTUAL TABLE places_fts USING fts5(
      name,
      address,
      editorial_summary,
      reviews_text,
      content=places,
      content_rowid=rowid
    )`,
    `CREATE TRIGGER places_fts_insert AFTER INSERT ON places BEGIN
      INSERT INTO places_fts(rowid, name, address, editorial_summary, reviews_text)
      VALUES (NEW.rowid, NEW.name, NEW.address, NEW.editorial_summary, NEW.reviews_text);
    END`,
    `CREATE TRIGGER places_fts_update AFTER UPDATE ON places BEGIN
      INSERT INTO places_fts(places_fts, rowid, name, address, editorial_summary, reviews_text)
      VALUES ('delete', OLD.rowid, OLD.name, OLD.address, OLD.editorial_summary, OLD.reviews_text);
      INSERT INTO places_fts(rowid, name, address, editorial_summary, reviews_text)
      VALUES (NEW.rowid, NEW.name, NEW.address, NEW.editorial_summary, NEW.reviews_text);
    END`,
    `CREATE TRIGGER places_fts_delete AFTER DELETE ON places BEGIN
      INSERT INTO places_fts(places_fts, rowid, name, address, editorial_summary, reviews_text)
      VALUES ('delete', OLD.rowid, OLD.name, OLD.address, OLD.editorial_summary, OLD.reviews_text);
    END`,
    `INSERT INTO sync_state (id) VALUES (1)`,
  ];

  for (const statement of ddl) {
    sqlite.prepare(statement).run();
  }
}
