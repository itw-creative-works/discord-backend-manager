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
## [1.2.40] - 2026-05-06
### Changed
- Migrate Chatsy auto-support from `/agents/{agentId}/chat` to the unified `/agents/chat` endpoint
- Pass agent ID in the request body as `id` (was a URL path param) and explicitly set `mode: 'live'`

### Added
- Chatsy lifecycle logs: pre-request (agentId, conversationId, message length), response (conversationId, message count), and failure log via `assistant.error()` so server-side errors are visible

---
## [1.2.39] - 2026-05-05
### Fixed
- Fix `TypeError: assistant.resolveAccount is not a function` in `getFirebaseAccount` that crashed `/beta`, `/account`, `/link`, `/sync`, and guild member updates after BEM removed `Assistant.resolveAccount`

### Changed
- Migrate to BEM's new user schema: `getFirebaseAccount` now returns the raw Firestore doc (matching BEM's `resolveUser` pattern), with no defaults merged in so writebacks stay clean
- Replace legacy `account.plan.id` reads with `User.resolveSubscription()` computed at the call site
- Replace `account.plan.expires.timestamp` with `account.subscription?.expires?.timestamp`
- Replace `account.activity.created.timestamp` with `account.metadata?.created?.timestamp`
- Convert all `account.auth.uid` and `account.roles.X` accesses to optional chaining so consumers safely handle missing user docs
- Bump `backend-manager` to ^5.0.200 and `discord.js` to ^14.26.4

---
## [1.2.38] - 2026-04-23
### Fixed
- Fix `autoActivityStarter` crash caused by yargs v18 no longer exposing static `.argv` — now call yargs as a function with `process.argv.slice(2)`

---
## [1.2.37] - 2026-04-23
### Changed
- Bump `backend-manager` to ^5.0.199, `discord.js` to ^14.26.3, and `prepare-package` to ^2.1.0

---
## [1.2.36] - 2026-04-06
### Changed
- Migrate Chatsy integration from deprecated `/converse` to new `/agents/{agentId}/chat` endpoint
- Remove bot mention requirement for auto-support when message has readable content
- Replace `accountId` + `chatId` config with single `agentId`
- Bump `backend-manager` to ^5.0.192 and `discord.js` to ^14.26.2

### Fixed
- Fix config reference from `supportInstructions` to `includeSupportInstructions`

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
