# Changelog

## [0.2.1](https://github.com/Rubio-Enterprises/gmaps-sync/compare/v0.2.0...v0.2.1) (2026-06-15)


### Features

* **cli:** add places CLI with init, pull, status, enrich, pending, prune ([f23467a](https://github.com/Rubio-Enterprises/gmaps-sync/commit/f23467a1b8695fbe9c234a28907631fcb54c0855))
* **core:** add database migration with all tables and FTS5 ([5e401b6](https://github.com/Rubio-Enterprises/gmaps-sync/commit/5e401b6b076fa4a78514c289db02ae690383ea14))
* **core:** add drizzle schema and database connection ([d0ad6dd](https://github.com/Rubio-Enterprises/gmaps-sync/commit/d0ad6ddce40be07520c459497be7e910ea3e0043))
* **core:** add embedding pipeline with sqlite-vec and ONNX model interface ([79b2a07](https://github.com/Rubio-Enterprises/gmaps-sync/commit/79b2a07a5ab1a2cd51795d8b275d93abd6704073))
* **core:** add enrichment pipeline with Places API client interface ([7799156](https://github.com/Rubio-Enterprises/gmaps-sync/commit/7799156b8dbec736dae743796d88e6761f92c53a))
* **core:** add simplified config without profiles ([f9287ba](https://github.com/Rubio-Enterprises/gmaps-sync/commit/f9287bad05f2c5139a20433af4d525a4f8631970))
* scaffold core package with types ([e46e837](https://github.com/Rubio-Enterprises/gmaps-sync/commit/e46e837e8b2953431736e0bab5f52333da82af13))
* **sync:** refactor session, diff, pull to use SQLite via drizzle ([0b677ed](https://github.com/Rubio-Enterprises/gmaps-sync/commit/0b677edbdcc5bd0d4981e52256f52399d884d495))
* **sync:** scaffold sync package with refactored parser ([b9aa70e](https://github.com/Rubio-Enterprises/gmaps-sync/commit/b9aa70e94cbf245931079c1aff62616d6f13e15e))


### Bug Fixes

* **ci:** make typecheck pass on fresh checkout (TS6310 build-mode) ([#28](https://github.com/Rubio-Enterprises/gmaps-sync/issues/28)) ([996f4d8](https://github.com/Rubio-Enterprises/gmaps-sync/commit/996f4d8ac0067b5dd246b743983496562e978035))
