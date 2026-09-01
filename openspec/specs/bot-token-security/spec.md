## Purpose

Defines how the system stores, encrypts, and uses Telegram bot tokens so that plaintext tokens never leave the server and are protected at rest in the database.

## Requirements

### Requirement: Bot token is encrypted at rest

The system SHALL store `Bot.token` encrypted using AES-256-GCM with a server-managed key (`BOT_TOKEN_ENCRYPTION_KEY`). The stored value SHALL use the format `enc:v1:<base64-nonce>.<base64-ciphertext+authTag>`.

#### Scenario: New token is saved

- **WHEN** a user publishes a bot for the first time and submits a Telegram token
- **THEN** the system encrypts the token before writing it to the database
- **AND** the stored value begins with `enc:v1:`

#### Scenario: Existing token is updated

- **WHEN** a user updates the bot token through the publish dialog
- **THEN** the system encrypts the new token before writing it to the database
- **AND** the previous encrypted value is replaced

#### Scenario: Token is used for Telegram API call

- **WHEN** the system needs to make a Telegram API call (register webhook, handle incoming update)
- **THEN** the token is decrypted in memory on the server
- **AND** the plaintext token is never written to logs, responses, or any client-facing payload

### Requirement: Bot token is never returned to the client

The system SHALL NOT include a plaintext or encrypted `Bot.token` in any RSC payload, Server Action response, or API response sent to the browser.

#### Scenario: Editor page loads for a published bot

- **WHEN** a user opens the workflow editor for a bot that already has a saved token
- **THEN** the RSC payload does NOT contain `initialToken` or any representation of the token

#### Scenario: Publish action responds to client

- **WHEN** `publishBotAction` completes successfully or with an error
- **THEN** the response object returned to the client does NOT include a `token` field

### Requirement: Publish dialog adapts based on whether a token exists

The system SHALL show a different publish dialog depending on whether the bot already has a saved token.

#### Scenario: Bot has no saved token (first publish)

- **WHEN** a user clicks "Publish" and the bot has no saved token
- **THEN** the publish dialog shows a token input field
- **AND** the user must enter a valid non-empty token to proceed

#### Scenario: Bot has a saved token (re-publish)

- **WHEN** a user clicks "Publish" and the bot already has a saved token
- **THEN** the publish dialog shows a confirmation view without a token input field
- **AND** the user confirms to publish using the existing token

#### Scenario: Empty token submitted on first publish

- **WHEN** a user attempts to publish without entering a token
- **THEN** the system rejects the request with a validation error
- **AND** the dialog remains open

### Requirement: Migration script encrypts existing plaintext tokens

The system SHALL provide a one-time idempotent migration script that encrypts all existing plaintext `Bot.token` values in the database.

#### Scenario: Script runs on a database with plaintext tokens

- **WHEN** `scripts/encrypt-tokens.ts` is executed
- **THEN** each `Bot.token` that does NOT begin with `enc:v1:` is encrypted and updated in the database

#### Scenario: Script runs on an already-migrated database

- **WHEN** `scripts/encrypt-tokens.ts` is executed on a database where all tokens already begin with `enc:v1:`
- **THEN** no records are updated (idempotent)

### Requirement: Missing encryption key causes startup-time failure

The system SHALL fail fast if `BOT_TOKEN_ENCRYPTION_KEY` is missing or malformed at the point of first use.

#### Scenario: Encryption key is absent

- **WHEN** any code path calls `encryptToken` or `decryptToken` and `BOT_TOKEN_ENCRYPTION_KEY` is not set or is not a valid 64-character hex string (32 bytes)
- **THEN** the function throws a descriptive error immediately
- **AND** no encryption or decryption proceeds
