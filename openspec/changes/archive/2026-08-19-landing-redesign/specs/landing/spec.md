## Purpose

Публичная посадочная страница для неавторизованных посетителей: коммуницирует ценность продукта (визуальный конструктор Telegram-ботов), объясняет как это работает, кому подходит и что уже готово vs. в roadmap, и ведёт на регистрацию/вход.

## ADDED Requirements

### Requirement: Landing page is shown only to unauthenticated visitors on `/`

Система SHALL показывать лендинг на маршруте `/{locale}` только когда у запроса нет активной сессии Supabase. Авторизованные пользователи SHALL получать дашборд, а не лендинг.

#### Scenario: Anonymous visitor sees landing
- **WHEN** неавторизованный пользователь открывает `/{locale}`
- **THEN** система отвечает страницей лендинга (hero, how-it-works, features, audience, roadmap, CTA, footer, landing-header)

#### Scenario: Authenticated user does not see landing
- **WHEN** пользователь с активной сессией открывает `/{locale}`
- **THEN** система отвечает дашбордом, а не лендингом

### Requirement: Landing page renders required sections in a fixed order

Страница лендинга MUST содержать следующие секции сверху вниз: landing-header, hero, how-it-works, features, audience, roadmap, cta, footer. Каждая секция MUST быть визуально самостоятельной (собственный контейнер и заголовок, кроме header/footer).

#### Scenario: All sections are present
- **WHEN** лендинг отрендерен
- **THEN** DOM содержит landing-header, `<section>` для hero, how-it-works, features, audience, roadmap, cta, и footer — в указанном порядке

### Requirement: All landing copy is internationalized

Весь пользовательский текст лендинга (заголовки, подзаголовки, описания секций, подписи кнопок, ярлыки навигации, alt-тексты) SHALL приходить из `next-intl` под namespace `Landing.*`. Хардкод строк на английском или русском в JSX компонентов лендинга NOT PERMITTED, за исключением технических атрибутов (`className`, id якорей).

#### Scenario: English locale renders English copy
- **WHEN** посетитель открывает `/en`
- **THEN** заголовки, подзаголовки и CTA лендинга SHALL совпадать с ключами из `src/shared/langs/en.json` → `Landing`

#### Scenario: Russian locale renders Russian copy
- **WHEN** посетитель открывает `/ru`
- **THEN** заголовки, подзаголовки и CTA лендинга SHALL совпадать с ключами из `src/shared/langs/ru.json` → `Landing`

#### Scenario: Missing translation keys are surfaced by CI
- **WHEN** какой-либо i18n-ключ лендинга существует в `en.json`, но отсутствует в `ru.json` (или наоборот)
- **THEN** существующая проверка типов/линтер `next-intl` SHALL сигнализировать это как ошибку сборки

### Requirement: Landing has a dedicated header separate from the app header

Лендинг MUST использовать собственный `LandingHeader` виджет, независимый от `src/widgets/header` (используется в авторизованной части). `LandingHeader` MUST содержать логотип-ссылку на `/`, якорную навигацию к секциям (как минимум: Features, How it works, Roadmap) и правую группу с CTA «Sign in» + «Get started».

#### Scenario: Landing header replaces app header on landing
- **WHEN** лендинг отрендерен
- **THEN** DOM содержит `LandingHeader`, но не содержит внутренний `Header` приложения из `src/widgets/header`

#### Scenario: Anchor navigation scrolls to sections
- **WHEN** пользователь кликает на пункт навигации `Features`
- **THEN** страница переходит к секции с id `features` (аналогично для `how-it-works`, `roadmap`)

#### Scenario: Header CTAs link to auth pages
- **WHEN** пользователь кликает на «Sign in» / «Get started» в `LandingHeader`
- **THEN** пользователь переходит на `/{locale}/login` / `/{locale}/signup` соответственно

### Requirement: Hero section presents value proposition and primary CTA

Hero-секция SHALL содержать: (1) основной заголовок с value proposition, (2) подзаголовок с 1–2 предложениями об объяснении продукта, (3) первичный CTA «Get started» ведущий на `/{locale}/signup`, (4) вторичный CTA «Sign in» ведущий на `/{locale}/login`, (5) визуальный элемент — скриншот/GIF редактора (в первой итерации допустим статический плейсхолдер в `public/landing/`).

#### Scenario: Primary CTA leads to signup
- **WHEN** посетитель кликает первичный CTA в hero
- **THEN** переход на `/{locale}/signup`

#### Scenario: Hero shows product visual
- **WHEN** hero отрендерен
- **THEN** секция содержит `<img>`/аналогичный элемент со ссылкой на ассет из `public/landing/` и осмысленным `alt` из i18n

### Requirement: How-it-works section shows product usage steps

Секция «How it works» SHALL показывать 3–4 пронумерованных шага использования продукта (например: create bot → design flow → publish → chat). Каждый шаг SHALL иметь заголовок и краткое описание, оба из i18n.

#### Scenario: Steps are rendered
- **WHEN** секция отрендерена
- **THEN** DOM содержит от 3 до 4 карточек шагов, каждая с заголовком и описанием

### Requirement: Features section lists currently implemented capabilities honestly

Секция «Features» SHALL показывать 4–6 фич, которые уже реализованы в проекте (визуальный редактор, публикация в Telegram, условная логика, сохранение черновиков, i18n RU/EN, изоляция данных между пользователями). Секция MUST NOT содержать формулировок про несуществующую функциональность (например, «team collaboration» или «enterprise ready», если это не реализовано).

#### Scenario: All features map to implemented capabilities
- **WHEN** список фич отрендерен
- **THEN** каждая фича соответствует одной из реализованных в кодовой базе возможностей и её описание не преувеличивает состояние продукта

### Requirement: Audience section describes target users

Секция «For whom» SHALL перечислять целевые аудитории (как минимум: solo makers, small agencies, internal company teams) с кратким описанием пользы для каждой.

#### Scenario: Audience segments are rendered
- **WHEN** секция отрендерена
- **THEN** DOM содержит минимум 3 сегмента с заголовком и описанием из i18n

### Requirement: Roadmap section is honest and public

Секция «Roadmap» SHALL показывать реальный статус: что уже готово («Available now»), что в работе («In progress»), что запланировано («Planned»). Формулировки MUST соответствовать пунктам `docs/roadmap.md` (без обещаний конкретных дат публичного релиза).

#### Scenario: Roadmap has three status buckets
- **WHEN** секция отрендерена
- **THEN** DOM содержит три группы (Available, In progress, Planned) с пунктами из i18n

### Requirement: Final CTA section drives signup

Финальная CTA-секция перед footer SHALL повторять первичный призыв «Get started» с ссылкой на `/{locale}/signup` и коротким мотивирующим подзаголовком.

#### Scenario: CTA click navigates to signup
- **WHEN** посетитель кликает кнопку в final CTA
- **THEN** переход на `/{locale}/signup`

### Requirement: Landing is responsive and accessible on desktop and mobile

Лендинг SHALL корректно отображаться на ширинах экрана от 360px до 1440px+. Все интерактивные элементы (кнопки, ссылки) MUST быть доступны с клавиатуры, иметь видимый focus state и семантически корректную разметку (`<header>`, `<nav>`, `<main>`, `<section>` с заголовками, `<footer>`).

#### Scenario: Mobile layout renders without horizontal overflow
- **WHEN** ширина viewport 360px
- **THEN** содержимое лендинга не вызывает горизонтальный скролл; навигация в `LandingHeader` сворачивается либо скрывается корректно

#### Scenario: Keyboard navigation works
- **WHEN** пользователь навигирует через Tab
- **THEN** порядок фокуса соответствует порядку секций, каждый интерактивный элемент получает видимый focus state
