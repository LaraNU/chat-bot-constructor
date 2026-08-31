## 1. Store — isDirty sematics fix

- [x] 1.1 В `workflow-store.ts` добавить `isSaving: boolean` в `WorkflowState` и `setSaving: (v: boolean) => void` в `WorkflowActions`; инициализировать `isSaving: false`
- [x] 1.2 Исправить `onNodesChange`: выставлять `isDirty: true` только для `type === 'add'`, `type === 'remove'`, `type === 'replace'`, `type === 'position'` с `dragging === false`; для `select`, `dimensions` и `position` с `dragging: true` — не изменять `isDirty`
- [x] 1.3 Экспортировать `useIsSaving` в `src/entities/workflow/model/store/index.ts`
- [x] 1.4 Написать unit-тесты для стора: убедиться, что `select`-change и `position` с `dragging: true` не меняют `isDirty`; `position` с `dragging: false` — меняет; `add`/`remove` — меняют; `isSaving` переключается через `setSaving`

## 2. Save workflow hook — isSaving in store

- [x] 2.1 Удалить локальный `useState<boolean>` (`isLoading`) из `useSaveWorkflow`; заменить на `isSaving`/`setSaving` из стора
- [x] 2.2 Добавить параметр `silent?: boolean` в тип `UseSaveWorkflowParams`; обернуть вызовы `toast.*` условием `if (!silent)`
- [x] 2.3 Добавить guard `if (isSaving) return;` первой строкой в `save()` перед `setSaving(true)`
- [x] 2.4 Убедиться, что `nodes` и `edges` читаются из стора через `store.getState()` внутри `save()` (не из closure на момент рендера) — чтобы автосохранение использовало актуальные данные
- [x] 2.5 Обновить возвращаемый тип `UseSaveWorkflowReturn`: удалить `isLoading`, добавить или убрать ненужные поля

## 3. Autosave hook

- [x] 3.1 Создать файл `src/features/save-workflow/model/use-autosave.ts`
- [x] 3.2 В хуке: подписаться на `isDirty` и `isSaving` из стора; при `isDirty && !isSaving` запускать `setTimeout` на 2000 мс → вызывать `save({ silent: true })`; сбрасывать таймер при каждом повторном вызове эффекта
- [x] 3.3 Экспортировать `useAutosave` через `src/features/save-workflow/index.ts`
- [x] 3.4 Написать unit-тесты: автосохранение запускается через 2 сек, сбрасывается при повторном изменении, не запускается при `isSaving: true`, не показывает тост

## 4. Save button — three states

- [x] 4.1 Обновить `SaveWorkflowButton`: читать `isDirty` и `isSaving` из стора; реализовать три состояния (clean / dirty / saving) согласно spec
- [x] 4.2 Добавить или обновить ключи i18n `WorkflowCanvas.savedButton` (или использовать уже существующий `saveButton`/`savingButton`) в `en.json` и `ru.json` для состояния «Сохранено»
- [x] 4.3 Убедиться, что ручное нажатие вызывает `save()` без `silent`, тост при успехе показывается

## 5. Mount autosave in editor

- [x] 5.1 Найти компонент `WorkflowEditorPage` (или аналогичный root компонент редактора)
- [x] 5.2 Импортировать и вызвать `useAutosave({ botId })` в этом компоненте

## 6. Tests

- [x] 6.1 Убедиться, что существующие unit-тесты `use-node-mutations.test.ts` проходят после изменения `onNodesChange`
- [x] 6.2 Проверить и при необходимости обновить Playwright E2E тесты редактора (если есть)

## 7. Roadmap and docs

- [x] 7.1 Отметить P1.5 как Done в `docs/roadmap.md` и `docs/roadmap-ru.md`
