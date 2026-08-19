## Context

Мотивация — см. `proposal.md § Why`. Текущее состояние: маршрут `/{locale}` в `src/app/[locale]/page.tsx` рендерит либо `DashboardPage` (для авторизованных), либо `LandingPage` (для гостей). `LandingPage` (`src/views/landing/ui/landing-page.tsx`) состоит только из `HeroSection` (`src/widgets/landing/hero-section`), где строки захардкожены на английском, кнопка ведёт на `/signup`, есть только один блок. Есть готовые примитивы `shared/ui` (`Button`, `Card`, и т.п.), `next-intl` с pattern `ScopedIntlProvider` для точечного проброса namespace'ов в клиентские компоненты, и i18n-`Link` из `@/i18n/navigation`. Пустой ключ `heroSection: {}` уже существует в `en.json`/`ru.json` — будет удалён и заменён на `Landing.*`.

Ограничения проекта:
- FSD-архитектура строго соблюдается (`shared → entities → features → widgets → app`); лендинг — набор виджетов, композируемых во `views/landing`.
- Клиентские компоненты, использующие `useTranslations`, должны рендериться внутри `NextIntlClientProvider` (через `ScopedIntlProvider`) — вне серверной ветки.
- Sticky header лендинга должен работать без гидратации ошибок (не смешивать SSR-only и client-only без нужды).

## Goals / Non-Goals

**Goals:**
- Заменить одноблочный лендинг структурой из 6 секций + отдельного header'а без нарушения FSD.
- Гарантировать полноту i18n RU/EN на момент мержа (никакого хардкода).
- Оставить возможность в будущем легко подменять hero-визуал (плейсхолдер → GIF/скриншот) без правки JSX.
- Не трогать существующий `src/widgets/header` (авторизованный header остаётся как есть).

**Non-Goals:**
- Не создаём новые роуты (`/features`, `/pricing`, `/docs`) — только якорные секции на `/`.
- Не добавляем аналитику посещений, A/B, cookie-баннер.
- Не переписываем `shared/ui` компоненты; используем существующие.
- Не готовим финальный дизайн-ассет hero — плейсхолдер SVG/PNG, реальный GIF задачей отдельно.
- Не переписываем `HeroSection` полностью с нуля, если можно эволюционировать (сохраняем слайс, меняем внутреннюю разметку и источник текстов).

## Decisions

### 1. Header для лендинга — отдельный виджет (variant B)
**Решение**: новый `src/widgets/landing/landing-header`.
**Альтернатива**: параметризовать существующий `src/widgets/header` пропсом `variant="landing"`.
**Почему отклонили**: авторизованный header уже усложнён (search, dropdowns, i18n), навигационные пункты и CTA у лендинга принципиально другие (anchors, «Sign in / Get started»). Смешение путает ответственности и разрастает пропсы. Отдельный виджет проще, каждый header остаётся тонким и специализированным.

### 2. Один namespace `Landing` с вложенными разделами
**Решение**: единая ветка `Landing.*` в `en.json`/`ru.json` с поддиректориями `Landing.header`, `Landing.hero`, `Landing.howItWorks`, `Landing.features`, `Landing.audience`, `Landing.roadmap`, `Landing.cta`.
**Альтернатива**: по namespace на каждую секцию (`LandingHero`, `LandingFeatures`, …).
**Почему отклонили**: `ScopedIntlProvider` придётся расширять на 7+ scopes, а фактически всё общается в рамках одной страницы. Один namespace = один scope, чище composition в `page.tsx`.

### 3. Existing ключ `heroSection` удаляется
Пустой `heroSection: {}` в `en.json`/`ru.json` — рудимент, безопасно удалить как часть этой задачи; upstream кода на него нет (`HeroSection` строки хардкодит).

### 4. Клиент/сервер границы
**Решение**: секции — Server Components, кроме `LandingHeader` (нужен клик по якорям, стилистически sticky, может понадобиться `useState` для мобильного меню — держим client). `LandingPage` — server. `useTranslations` доступен и в server, и в client через `next-intl` при правильной настройке; для клиентских частей оборачиваем в `ScopedIntlProvider scopes={['Landing']}`.
**Почему**: минимизируем клиентский JS bundle лендинга (важен для performance/SEO). Мобильное меню (если понадобится) — единственная точка интерактивности.

### 5. Ссылки — через `@/i18n/navigation` `Link`
Все `href` — на `/login`, `/signup` и якоря `#features`, `#how-it-works`, `#roadmap`. Не использовать `next/link` напрямую (нарушит locale routing).

### 6. Визуал hero
**Решение**: плейсхолдер (SVG-заглушка с иллюстрацией «canvas editor mock» или упрощённый PNG-скриншот) в `public/landing/hero-editor.svg`. Заменяется на реальный скриншот/GIF без изменения JSX.
**Почему**: не блокируем задачу на подготовке медиа-ассета; замена — тривиальный commit позднее.

### 7. Features — список только из реализованного
Список фич генерируется из ключей i18n; каждая фича — иконка (`lucide-react`), заголовок, короткое описание. Начальный набор:
- Visual editor (React Flow canvas)
- Node types: message, question, choice, condition, summary, end
- One-click publish в Telegram
- Draft vs published статусы
- Изоляция ботов по пользователю
- Bilingual UI (RU/EN)

### 8. Roadmap — два источника правды
Секция roadmap на лендинге черпает содержимое из i18n, но текст SHALL синхронизироваться с `docs/roadmap.md` вручную (или через отдельную задачу автоматизации). Явно фиксируем это как «operational contract», чтобы не рассинхронизировалось.

### 9. Тестирование
Минимум: по одному render-тесту на новые виджеты, проверяющему что заголовок и CTA берутся из i18n и ссылки корректны. E2E (Playwright) — отдельная задача; не блокируем MR.

## Risks / Trade-offs

- **Копирайты быстро устаревают** → в roadmap-секции формулировки общие («Under active development», без дат); фичи синхронизируются с реально работающим кодом (revisит при каждом крупном изменении функциональности).
- **RU-перевод хуже качеством, чем EN** → писать копирайты сразу с ориентацией на RU-tone-of-voice; сделать peer-review переводов перед мержем.
- **Плейсхолдер-визуал выглядит недоделанным** → в UI размер контейнера hero-визуала уже финальный, замена ассета не сдвинет layout. Дополнительно можно поставить `label` «Preview» в углу заглушки.
- **Мобильная навигация в `LandingHeader`** → в первой итерации на mobile прячем anchor-nav (только логотип + CTA); гамбургер-меню — follow-up. Это не мешает воспринимать лендинг с телефона.
- **Расхождение с `docs/roadmap.md`** → фиксируем в PR-description и в комментарии к секции `roadmap-section.tsx` предупреждение «keep in sync with docs/roadmap.md».
- **Импортируемые пути** → строго через public API слайсов (`@/widgets/landing/hero-section` и т.п.), никаких `@/widgets/landing/hero-section/ui/hero-section`.

## Migration Plan

Deploy-риск близок к нулю: изменение затрагивает только неавторизованную ветку `/{locale}`. Rollback = откат PR. Никаких миграций БД, никаких breaking API-изменений.

Порядок:
1. Мерж feature-ветки → превью на Vercel.
2. Ручная приёмка на превью (RU/EN, mobile/desktop).
3. Мерж в `main`.
