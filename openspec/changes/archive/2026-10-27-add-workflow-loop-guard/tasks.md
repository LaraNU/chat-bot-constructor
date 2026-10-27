## 1. Node semantics — waiting nodes

- [x] 1.1 Создать `src/entities/workflow/model/node-semantics.ts`: исчерпывающий `Record<WorkflowNodeType, { waitsForInput: boolean }>` (`question`, `choice` → `true`, остальные → `false`) и `isWaitingNodeType(type)`; реэкспортировать через `src/entities/workflow/index.ts`. Проверка: `npx tsc --noEmit` проходит, импорт `isWaitingNodeType` из `@/entities/workflow` доступен
- [x] 1.2 Добавить тест-инвариант в `src/features/telegram-webhook/lib/nodes/`: для каждого типа из registry `isWaitingNodeType(type)` совпадает с тем, возвращает ли handler в сценарии первого входа `shouldStop: true` (fetch/prisma замоканы, как в существующих тестах handler'ов). Проверка: тест проходит в `npm test`

## 2. Graph analysis — cycle detection

- [x] 2.1 Создать `src/entities/workflow/lib/graph/find-unsafe-cycles.ts` с `findNodesInUnsafeCycles(nodes, edges): Set<string>` — итеративный Tarjan SCC по подграфу нод без ожидания; нода в цикле, если её SCC > 1 ноды или есть петля на себя; рёбра на несуществующие ноды игнорируются. Проверка: тесты из 2.3 проходят
- [x] 2.2 В том же модуле реализовать `wouldCreateUnsafeCycle(nodes, edges, { source, target }): boolean` — `false`, если source или target — нода ожидания; `true` при `source === target`; иначе BFS от `target` до `source` по подграфу без нод ожидания. Проверка: тесты из 2.3 проходят
- [x] 2.3 Написать `find-unsafe-cycles.test.ts`: петля на себя; `A → B → A`; цикл через ветку `condition` (обе ветки); цикл через `question` и через `choice` → пусто; ацикличный граф → пусто; все ноды цикла попадают в результат; висячее ребро не ломает анализ; для `wouldCreateUnsafeCycle` — замыкание цикла без ожидания → `true`, через ноду ожидания → `false`, прямое соединение без цикла → `false`. Проверка: `npm test` зелёный
- [x] 2.4 Экспортировать обе функции через `src/entities/workflow/lib/index.ts` и публичный `src/entities/workflow/index.ts`. Проверка: `npx tsc --noEmit` проходит

## 3. Validation phase

- [x] 3.1 Создать `src/entities/workflow/lib/validation/validate-cycles.ts`: по одному issue на ноду из `findNodesInUnsafeCycles` — `severity: 'error'`, `code: 'CYCLE_WITHOUT_WAITING_NODE'`, `nodeId`, `messageKey: 'validation.cycleWithoutWaitingNode'`. Проверка: тесты из 3.3 проходят
- [x] 3.2 Подключить фазу в `validate-workflow.ts` и обновить JSDoc со списком фаз. Проверка: существующий `validate-workflow.test.ts` проходит без изменений
- [x] 3.3 Написать `validate-cycles.test.ts` на фикстурах из `validation/test-utils/fixtures.ts` и добавить в `validate-workflow.test.ts` кейс: граф с циклом без ожидания → `isValid: false`, `errorCount` учитывает каждую ноду цикла. Проверка: `npm test` зелёный

## 4. Runtime guard

- [x] 4.1 Создать `WorkflowExecutionLimitError` (поля `reason: 'cycle' | 'step_limit'`, `nodeId`, `botId`) в `src/features/telegram-webhook/lib/` рядом с движком. Проверка: `npx tsc --noEmit` проходит
- [x] 4.2 В `engine.ts` добавить `Set` выполненных нод без ожидания (через `isWaitingNodeType`) и константу `MAX_STEPS_PER_UPDATE = 100`; при повторном входе в ноду без ожидания бросать ошибку с `reason: 'cycle'` до вызова handler'а, при превышении лимита — с `reason: 'step_limit'`. Проверка: тесты из 4.3 проходят
- [x] 4.2a В `engine.ts` передавать `initialNodeId` только первому выполняемому handler'у, всем последующим — `null`, чтобы повторный вход в `question`/`choice` в рамках того же update отправлял вопрос заново, а не повторно потреблял ответ. Проверка: тест из 4.3 «возврат к question после ответа» проходит
- [x] 4.3 Дополнить `engine.test.ts`: цикл `message A → message B → message A` — handler A вызван ровно один раз, B — один раз, брошена ошибка `cycle` с `nodeId` A; цикл через `condition` обрывается; цикл через `question` штатно останавливается на `shouldStop` без ошибки; возобновление с `initialNodeId` = question, путь которого возвращается к тому же question, — без ошибки, и при повторном входе handler question получает `initialNodeId: null`; длинная цепочка выше лимита (мок handler'а, всегда возвращающий новую ноду) — ошибка `step_limit`; существующие тесты проходят без изменений. Проверка: `npm test` зелёный
- [x] 4.4 Убедиться, что `controller.ts` не требует изменений (ошибка ловится общим `catch`, ответ 200, сессия не сохраняется), и зафиксировать это тестом в существующем тест-файле контроллера, если он мокает движок. Проверка: тест контроллера проходит

## 5. Canvas connection guard

- [x] 5.1 В `src/widgets/workflow-canvas/ui/workflow-canvas.tsx` передать в `ReactFlow` `isValidConnection` — `useCallback`, читающий `nodes`/`edges` из `useWorkflowStoreApi().getState()` и возвращающий `!wouldCreateUnsafeCycle(...)`. Проверка: `npx tsc --noEmit` и `npm run lint` проходят
- [x] 5.2 Ручная проверка в `npm run dev`: связь `message B → message A` при существующей `A → B` не создаётся и подсвечивается как невалидная; связь `message M → question Q` при `Q → M` создаётся; петля `message → тот же message` не создаётся; обычная связь создаётся. Результат зафиксировать в описании PR

## 6. Docs and final verification

- [x] 6.1 Обновить статус P1.13 на `Done` в `docs/roadmap.md` и `docs/roadmap-ru.md`; если `docs/cursor-context.md` описывает гарантии runtime или валидации — добавить правило «нет циклов без ноды ожидания». Проверка: diff документации соответствует реализации
- [x] 6.2 Прогнать полный пайплайн: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`. Проверка: все команды завершаются без ошибок
- [x] 6.3 `openspec validate add-workflow-loop-guard --strict` проходит
