## Why

Редактор сохраняет workflow только вручную; при этом флаг `isDirty` выставляется при любом `onNodesChange` — включая выделение и перетаскивание ноды без изменения данных. Это создаёт false-positive «несохранённые изменения» и блокирует публикацию, а отсутствие автосохранения означает потерю работы при случайном закрытии вкладки. Оба дефекта блокируют допуск внешних пользователей (P1.5 в roadmap).

## What Changes

- **`isDirty` семантика:** `onNodesChange` в сторе фильтрует `NodeChange` по типу — только `remove`, `add`, `replace` и `position` с `dragging: false` выставляют `isDirty: true`; `select` и `position` с `dragging: true` — не выставляют.
- **`isSaving` в сторе:** новый булев флаг и экшен `setSaving`; используется для блокировки параллельных сохранений (автосохранение + ручная кнопка + публикация).
- **Новый хук `useAutosave`** в `features/save-workflow`: подписывается на `isDirty` из стора, дебаунсит 2 сек, вызывает `save()` из `useSaveWorkflow`.
- **`useSaveWorkflow` обновлён:** использует `isSaving` из стора вместо локального `useState`, guard не позволяет двум сохранениям пересечься.
- **Нет тоста при автосохранении:** кнопка меняет текст/состояние; тост показывается только при ручном сохранении.
- **Обновлена `SaveWorkflowButton`:** три состояния — `isDirty=false` → «Сохранено» (неактивна), `isDirty=true` → «Сохранить» (активна), `isSaving=true` → «Сохраняется…» (disabled).
- **`WorkflowEditorPage`** монтирует `useAutosave`.

## Capabilities

### New Capabilities

- Нет новых capabilities: изменение затрагивает поведение существующего редактора.

### Modified Capabilities

- `workflow-editor`: добавляются требования к автосохранению, корректной семантике `isDirty` и обратной связи о состоянии сохранения.

## Impact

- `src/entities/workflow/model/store/workflow-store.ts` — фикс `onNodesChange`, добавление `isSaving`/`setSaving`.
- `src/features/save-workflow/model/use-save-workflow.ts` — использует `isSaving` из стора.
- `src/features/save-workflow/model/use-autosave.ts` — новый файл.
- `src/features/save-workflow/ui/save-button.tsx` — три состояния UI.
- `src/views/workflow-editor/ui/workflow-editor-page.tsx` — монтирует `useAutosave`.
- Тесты стора: `workflow-store.test.ts` (новый), обновление `use-node-mutations.test.ts` если нужно.
- `docs/roadmap.md`, `docs/roadmap-ru.md` — P1.5 → Done.
