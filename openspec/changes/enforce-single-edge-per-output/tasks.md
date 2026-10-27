## 1. Node semantics — outputs

- [ ] 1.1 В `src/entities/workflow/model/node-semantics.ts` добавить в `NodeSemantics` поле `outputs: 'single' | 'perHandle' | 'none'` с JSDoc и заполнить `WORKFLOW_NODE_SEMANTICS`: `start`, `message`, `question`, `summary` получают `'single'`; `choice`, `condition` получают `'perHandle'`; `end` получает `'none'`. Проверка: `npx tsc --noEmit` проходит
- [ ] 1.2 Дополнить `src/features/telegram-webhook/lib/nodes/node-semantics.test.ts` инвариантом: у ноды с `outputs: 'none'` нет source-handle'ов, то есть `end` — единственный такой тип, а `'perHandle'` есть только у типов, handler которых выбирает ребро по `sourceHandle` (`choice`, `condition`). Проверка: тест проходит в `npm test`

## 2. Graph analysis — output occupancy

- [ ] 2.1 Создать `src/entities/workflow/lib/graph/node-outputs.ts`: хелпер ключа выхода с нормализацией `sourceHandle ?? null`, группировку рёбер по выходу (`groupEdgesByOutput`) и `isOutputOccupied(edges, { source, sourceHandle }): boolean`. Проверка: тесты из 2.2 проходят
- [ ] 2.2 Написать `node-outputs.test.ts`: `null` и `undefined` у `sourceHandle` считаются одним выходом; разные кнопки `choice` — разные выходы; `true` и `false` у `condition` — разные выходы; выход без рёбер свободен; выход с ребром занят; ребро другой ноды на результат не влияет. Проверка: `npm test` зелёный
- [ ] 2.3 Экспортировать функции через `src/entities/workflow/lib/graph/index.ts`, `src/entities/workflow/lib/index.ts` и публичный `src/entities/workflow/index.ts`. Проверка: `npx tsc --noEmit` проходит

## 3. Validation

- [ ] 3.1 В `validate-node-connections.ts` добавить проверку `MULTIPLE_EDGES_FROM_OUTPUT`: по одному issue `severity: 'error'` на выход, у которого больше одного ребра, с `nodeId`, `messageKey: 'validation.multipleEdgesFromOutput'` и `messageParams: { handleId, count }`. Группировку брать из 2.1, а не реализовывать заново; обновить JSDoc функции. Проверка: тесты из 3.4 проходят
- [ ] 3.2 В том же файле добавить проверку `NODE_HAS_NO_OUTGOING_EDGE` (`severity: 'warning'`, `messageKey: 'validation.nodeHasNoOutgoingEdge'`) для нод с `WORKFLOW_NODE_SEMANTICS[type].outputs === 'single'`, кроме `start`, у которых нет исходящих рёбер. Проверка: тесты из 3.4 проходят
- [ ] 3.3 Создать `node-validators/message-validator.ts` и `node-validators/question-validator.ts`: `EMPTY_NODE_TEXT` (`severity: 'error'`, `messageKey: 'validation.emptyNodeText'`), если `data.text?.trim()` пустой. Зарегистрировать оба в `node-validators/registry.ts`. Проверка: тесты из 3.4 проходят
- [ ] 3.4 Тесты на фикстурах из `validation/test-utils/fixtures.ts`. В `validate-node-connections.test.ts`: два ребра из `message` дают одну ошибку; два ребра из одной кнопки `choice` дают ошибку; по ребру на `true`/`false` и на каждую кнопку не дают ошибок; ребро без `sourceHandle` и ребро с `sourceHandle: null` из одной ноды дают ошибку; тупиковые `message`, `question` и `summary` дают warning, а `end`, `start`, `choice` и `condition` этот warning не дают. В `validate-node-data.test.ts`: пустой и пробельный текст у `message`/`question` дают ошибку; `message` с пустым текстом и непустым `attachmentIds` даёт ошибку; заполненный текст ошибок не даёт. Проверка: `npm test` зелёный
- [ ] 3.5 В `validate-workflow.test.ts` добавить кейс на граф из исходного отчёта: `start → M1`, `M1 → M2 → end`, `M1 → M3`, все тексты пустые. Ожидается `isValid: false`; среди issue есть `MULTIPLE_EDGES_FROM_OUTPUT` для M1, `EMPTY_NODE_TEXT` для M1, M2 и M3 и `NODE_HAS_NO_OUTGOING_EDGE` для M3. Существующие тесты проходят без изменений. Проверка: `npm test` зелёный

## 4. Canvas connection guard

- [ ] 4.1 В `src/widgets/workflow-canvas/ui/workflow-canvas.tsx` расширить `isValidConnection`: сначала `isOutputOccupied(currentEdges, { source, sourceHandle })`, затем существующий `wouldCreateUnsafeCycle`. Обновить комментарий над callback'ом. Проверка: `npx tsc --noEmit` и `npm run lint` проходят
- [ ] 4.2 Ручная проверка в `npm run dev`. Второе ребро из `message` не создаётся и подсвечивается как невалидное. Второе ребро из той же кнопки `choice` не создаётся. Ребро из ветки `false` у `condition` при занятой `true` создаётся. После удаления единственного ребра из `message` новое ребро создаётся. Drag от target-handle к занятому source-handle тоже отклоняется. Загрузка сохранённого графа из отчёта: рёбра отображаются, Publish блокируется toast'ом с количеством ошибок, сохранение показывает «saved with errors». Результат зафиксировать в описании PR

## 5. Docs and final verification

- [ ] 5.1 В `docs/cursor-context.md` добавить рядом с «Loop guard invariant» инвариант «одно ребро на выход ноды» (где он соблюдается: `isValidConnection` и `MULTIPLE_EDGES_FROM_OUTPUT`; рантайм опирается на него и следует за единственным ребром) и обновить описание фаз валидации в строке 109. В `docs/roadmap.md` и `docs/roadmap-ru.md` отметить в P2.11 часть «несколько выходов у линейных нод» как сделанную; подсветка ошибок и тёмная тема остаются открытыми. Проверка: diff документации соответствует реализации
- [ ] 5.2 Прогнать полный пайплайн: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`. Проверка: все команды завершаются без ошибок
- [ ] 5.3 `openspec validate enforce-single-edge-per-output --strict` проходит
