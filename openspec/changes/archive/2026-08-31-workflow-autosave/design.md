## Context

Редактор использует Zustand-стор (`workflow-store.ts`) с `isDirty: boolean` и `markClean()`. Сохранение реализовано в `useSaveWorkflow`, который держит `isLoading` в локальном `useState`. Кнопка сохранения читает только `isLoading` из хука. Автосохранения нет.

Корень `isDirty` false-positive: `onNodesChange` выставляет `isDirty: true` на любой `NodeChange`, включая `select` (React Flow эмитирует его каждый раз при клике на ноду) и `position` с `dragging: true` (непрерывные обновления во время drag).

## Goals / Non-Goals

**Goals:**
- Устранить false-positive `isDirty` — выставлять флаг только при реальном изменении данных/позиции.
- Перенести `isSaving` из хука в стор — единый источник истины для всех потребителей.
- Реализовать `useAutosave` с debounce 2 сек; без тостов.
- Привести кнопку к трём состояниям: clean / dirty / saving.
- Гарантировать, что только одно сохранение выполняется единовременно.

**Non-Goals:**
- Google OAuth или изменения в auth flow.
- Публикация бота (отдельный хук `usePublishBot`; его поведение не меняется).
- Optimistic updates / offline queue.
- Конфликт разрешения при одновременном редактировании с другого устройства.

## Decisions

### 1. Фильтрация `NodeChange` по типу в `onNodesChange`

`NodeChange` имеет дискриминантный union по полю `type`:

| type | dirty? | обоснование |
|---|---|---|
| `add` | да | новая нода — данные изменились |
| `remove` | да | нода удалена |
| `replace` | да | данные ноды заменены |
| `position` с `dragging: false` | да | drag завершён, позиция зафиксирована |
| `position` с `dragging: true` | нет | промежуточные координаты, не сохраняются |
| `select` | нет | UI-состояние, не влияет на данные |
| `dimensions` | нет | внутреннее измерение React Flow, не хранится |
| `reset` | нет | восстановление состояния (не меняет данные пользователя) |

Альтернатива — сравнение snapshot before/after через `JSON.stringify`. Отклонена: O(n) при каждом изменении, ложная сложность для чистого type-dispatch.

### 2. `isSaving` в сторе, не в `useState`

`useSaveWorkflow` вызывается из двух точек: `SaveWorkflowButton` (ручное) и `useAutosave` (автоматическое). Если `isSaving` локальный — каждый экземпляр хука имеет независимый флаг, guard не работает. В сторе флаг один, изменение видно всем подписчикам немедленно.

Добавляем в `WorkflowState`:
```ts
isSaving: boolean;
```
Добавляем в `WorkflowActions`:
```ts
setSaving: (value: boolean) => void;
```

`useSaveWorkflow` читает `isSaving` из стора; guard `if (isSaving) return` в начале `save()`.

### 3. `useAutosave` как отдельный хук в `features/save-workflow`

Причина выделения: единственная ответственность — подписка на `isDirty` + debounce + вызов `save()`. Монтируется в `WorkflowEditorPage`, не в кнопку. Это позволяет автосохранению работать независимо от того, смонтирована ли кнопка.

Реализация:

```ts
const isDirty = useIsDirty();
const isSaving = useIsSaving();
const { save } = useSaveWorkflow({ botId });

useEffect(() => {
  if (!isDirty || isSaving) return;
  const timer = setTimeout(() => { save(); }, 2000);
  return () => clearTimeout(timer);
}, [isDirty, isSaving, save]);
```

`save()` из `useSaveWorkflow` уже стабильный (обёрнут в `useCallback`). Зависимости корректны.

Альтернатива — `useDebounce` хук (если уже есть в shared). Предпочтён inline `setTimeout`/`clearTimeout` для прозрачности побочного эффекта и простоты тестирования.

### 4. Toast только при ручном сохранении

`useSaveWorkflow` принимает опциональный параметр `silent?: boolean`. При `silent: true` тосты не показываются. `useAutosave` передаёт `silent: true`. Кнопка сохранения — `silent: false` (default).

Альтернатива — два отдельных хука. Отклонена: дублирование логики сохранения.

### 5. Три состояния `SaveWorkflowButton`

Кнопка читает `isDirty` и `isSaving` из стора напрямую. `isLoading` из хука удаляется, так как заменяется `isSaving` из стора.

## Risks / Trade-offs

**[Risk] Debounce блокирует выход со страницы без сохранения.**
→ Mitigation: за пределами данного change — реализуется в отдельном P1.x через `beforeunload` warning. Для MVP приемлемо.

**[Risk] Одновременное автосохранение и ручное сохранение.**
→ Mitigation: guard `if (isSaving) return` в начале `save()` + в `useAutosave`. Guard работает только если `isSaving` установлен до `await` — `setSaving(true)` вызывается синхронно первой строкой в `save()`.

**[Risk] `save()` в `useAutosave` захватывает `nodes`/`edges` через closure в момент старта debounce.**
→ Mitigation: `save` читает `nodes` и `edges` из стора внутри через Zustand selector в момент вызова, не из closure — нужно переписать с `useCallback` с нулевыми зависимостями, читающим стор напрямую через `useStore(storeApi)` (или `store.getState()`). Это должно быть проверено при реализации.

## Migration Plan

Поэтапное изменение в рамках одного PR:
1. Обновить стор: добавить `isSaving`/`setSaving`, исправить `onNodesChange`.
2. Обновить `useSaveWorkflow`: заменить локальный `isLoading` на `isSaving` из стора, добавить `silent` параметр.
3. Создать `useAutosave`.
4. Обновить `SaveWorkflowButton`.
5. Смонтировать `useAutosave` в `WorkflowEditorPage`.
6. Обновить тесты.
7. Обновить roadmap.

Rollback: PR не мержится до прохождения всех тестов; stale saves не вызывают потерю данных (save — идемпотентная операция).
