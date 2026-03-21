# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Changelog Categories

- `BREAKING` for breaking changes.
- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

---
## [1.2.33] - 2026-03-21
### Deprecated
- Commented out `/premium` moderator command and `processStaffPremium` auto-premium helper — both directly wrote premium plans to Firestore, which is no longer the desired flow

---
## [1.2.28] - 2026-03-16
### Changed
- Renamed entity concept from `app` to `brand` across the codebase (variables, properties, endpoint paths, schemas)

---
## [1.0.0] - 2024-06-19
### Added
- Initial release of the project 🚀
