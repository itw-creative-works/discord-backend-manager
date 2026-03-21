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
## [1.2.35] - 2026-03-21
### Fixed
- Skip deprecated commands with empty or invalid data during registration, fixing `toJSON is not a function` crash caused by commented-out premium.js exporting `data: []`

---
## [1.2.34] - 2026-03-21
### Fixed
- Fixed crash in `resolveCommand` when `command.data` lacks `setDefaultMemberPermissions` (e.g. when `loadCommand` fallback returns a raw array)

### Changed
- Bumped `@discordjs/voice` to ^0.19.2 and `backend-manager` to ^5.0.168

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
