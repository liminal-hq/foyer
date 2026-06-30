// SQLite schema migrations for Foyer's local store (items, people, rules)
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

use tauri_plugin_sql::{Migration, MigrationKind};

/// The SQLite database URL, relative to the app data directory.
pub const DB_URL: &str = "sqlite:foyer.db";

/// Ordered schema migrations. Mirrors the data model in SPEC.md §6.
pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_core_tables",
        kind: MigrationKind::Up,
        sql: r#"
            CREATE TABLE people (
                id           TEXT PRIMARY KEY,
                display_name TEXT NOT NULL,
                handles      TEXT NOT NULL DEFAULT '[]',
                weight       INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE items (
                id          TEXT PRIMARY KEY,
                source      TEXT NOT NULL,
                source_app  TEXT,
                person_id   TEXT REFERENCES people(id),
                received_at INTEGER NOT NULL,
                title       TEXT NOT NULL DEFAULT '',
                body        TEXT NOT NULL DEFAULT '',
                gist        TEXT,
                bucket      TEXT NOT NULL DEFAULT 'can-wait',
                state       TEXT NOT NULL DEFAULT 'active',
                later_until INTEGER,
                thread_key  TEXT NOT NULL DEFAULT ''
            );
            CREATE INDEX idx_items_state_bucket ON items(state, bucket);
            CREATE INDEX idx_items_thread ON items(thread_key);

            CREATE TABLE rules (
                id     TEXT PRIMARY KEY,
                match  TEXT NOT NULL DEFAULT '{}',
                action TEXT NOT NULL
            );
        "#,
    }]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn migration_versions_are_strictly_increasing() {
        let versions: Vec<i64> = migrations().iter().map(|m| m.version).collect();
        let mut sorted = versions.clone();
        sorted.sort_unstable();
        sorted.dedup();
        assert_eq!(
            versions, sorted,
            "migration versions must be unique and ascending"
        );
    }

    #[test]
    fn every_migration_has_sql() {
        for m in migrations() {
            assert!(
                !m.sql.trim().is_empty(),
                "migration {} has empty SQL",
                m.version
            );
        }
    }

    #[test]
    fn schema_defines_the_core_tables() {
        let sql = migrations()[0].sql;
        for table in ["items", "people", "rules"] {
            assert!(
                sql.contains(&format!("CREATE TABLE {table}")),
                "missing table {table}"
            );
        }
    }
}
