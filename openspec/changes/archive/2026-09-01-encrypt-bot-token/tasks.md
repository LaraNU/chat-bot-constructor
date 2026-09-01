## 1. Crypto utility

- [x] 1.1 Create `src/shared/lib/crypto/token-cipher.ts` with `encryptToken(plaintext: string): string` and `decryptToken(stored: string): string` using AES-256-GCM; validate `BOT_TOKEN_ENCRYPTION_KEY` length (must be 64 hex chars) and throw a descriptive error if absent or malformed
- [x] 1.2 Export `encryptToken` / `decryptToken` from `src/shared/lib/crypto/index.ts`
- [x] 1.3 Add `BOT_TOKEN_ENCRYPTION_KEY` to `.env.example` with generation command and explanation
- [x] 1.4 Write unit tests for `token-cipher.ts`: encrypt → decrypt round-trip, idempotence of `enc:v1:` prefix detection, error on missing key, error on tampered ciphertext (GCM auth tag failure)

## 2. Repository layer — encrypt on write

- [x] 2.1 In `src/entities/bot/server/repository.ts`, call `encryptToken(token)` before writing `token` to the DB in `createBot` and any `updateBotToken` / upsert methods; do NOT decrypt in the repository layer (return raw stored string)

## 3. Server-side consumers — decrypt on use

- [x] 3.1 In `src/features/publish-bot/api/actions.ts` (`publishBotAction`): when `token` param is provided, encrypt and save; when `token` param is omitted, read encrypted token from DB and call `decryptToken()` before passing to Telegram API
- [x] 3.2 In `src/features/telegram-webhook/api/controller.ts`: call `decryptToken(bot.token)` before using it for Telegram API calls

## 4. Remove token from RSC payload

- [x] 4.1 In `src/app/[locale]/editor/[id]/page.tsx`: replace `const initialToken = bot.token ?? null` with `const hasToken = bot.token !== null`; pass `hasToken` prop instead of `initialToken` to `WorkflowEditorPage`
- [x] 4.2 Update `src/views/workflow-editor/ui/workflow-editor-page.tsx`: replace `initialToken` prop with `hasToken: boolean`; thread it down to `PublishBotButton`
- [x] 4.3 Update `src/features/publish-bot/ui/publish-button.tsx`: replace `initialToken` prop with `hasToken: boolean`; pass to `usePublishBot`

## 5. Publish dialog UX — dual mode

- [x] 5.1 In `src/features/publish-bot/model/use-publish-bot.ts`: accept `hasToken: boolean` instead of `initialToken`; remove `useState(initialToken ?? '')` initialisation; derive dialog variant (`'confirm' | 'input-token'`) from `hasToken`
- [x] 5.2 In `src/features/publish-bot/ui/publish-button.tsx`: when `hasToken` is true, render confirmation dialog (no token input, "Publish" button calls `publishBotAction` without `token` arg); when false, render token input dialog as before
- [x] 5.3 Update `publishBotAction` signature to accept `token?: string` (optional); add server-side guard: if `token` is undefined and no token is in DB, return error `{ success: false, error: 'token_required' }`

## 6. Migration script

- [x] 6.1 Create `scripts/encrypt-tokens.ts`: fetch all bots where `token IS NOT NULL AND token NOT LIKE 'enc:v1:%'`, encrypt each with `encryptToken`, update in DB; log count of rows updated; handle errors gracefully
- [x] 6.2 Verify the script is idempotent: running twice produces no additional updates on the second run
- [x] 6.3 Add script invocation instructions to `README.md` under a "Database migrations" or "Security" section

## 7. i18n

- [x] 7.1 Add `WorkflowCanvas.publishDialog.confirmDescription` and `confirmPublishBtn` keys to `src/shared/langs/en.json` and `ru.json` for the re-publish confirmation dialog variant

## 8. Tests

- [x] 8.1 Update `src/features/publish-bot/model/use-publish-bot.test.ts` (if it exists) or add unit tests: `hasToken=false` renders token input, `hasToken=true` renders confirmation; successful publish without token calls action correctly
- [x] 8.2 Verify existing Playwright tests still pass; update any test that references `initialToken` prop or token input visibility in the publish dialog
