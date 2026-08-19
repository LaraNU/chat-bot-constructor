## Why

Текущая посадочная страница (`src/views/landing/ui/landing-page.tsx`, `src/widgets/landing/hero-section`) — только hero-блок на английском, без объяснения, что делает продукт, для кого он, и что уже работает. Проект выходит на более широкую аудиторию (solo makers, agencies, внутреннее использование в компании), и текущая страница не даёт неавторизованному посетителю понять ценность продукта и принять решение «зарегистрироваться / попробовать». Полноценный лендинг нужен до расширения P1 функциональности, потому что без него сложно показывать продукт внешним пользователям для теста и сбора обратной связи (issue #85).

## What Changes

- Заменить одиночный hero-only лендинг полноценной страницей с секциями: hero, «Как это работает» (steps), «Возможности» (features), «Для кого» (audience), «Roadmap / скоро», CTA, footer.
- Ввести отдельный лендинг-хедер (variant B): собственный хедер только для неавторизованных посетителей на `/`, с якорной навигацией (Features, How it works, Roadmap) и CTA «Sign in / Get started». Основной хедер приложения (`src/widgets/header`) не трогаем — он остаётся для авторизованной части.
- Ввести i18n сразу: перенести все копирайты лендинга в `src/shared/langs/en.json` и `src/shared/langs/ru.json` под новым namespace (`Landing.*`), заменить хардкод в компонентах на `useTranslations('Landing.*')`.
- Отделить визуал: hero-скриншот/GIF редактора для наглядности (плейсхолдер-ассет в `public/landing/`, замена на реальный контент — отдельный тикет).
- Реорганизовать FSD-структуру widgets лендинга: сохранить `hero-section`, добавить `how-it-works-section`, `features-section`, `audience-section`, `roadmap-section`, `cta-section`, `landing-header`. `LandingPage` во `views/landing` собирает их.
- Показывать в roadmap-секции честный статус (что уже есть vs. что запланировано), без «Enterprise Ready»-обещаний, которых нет в продукте.
- Ссылки CTA ведут на существующие маршруты аутентификации (`/login`, `/signup`); никаких новых страниц/роутов не добавляется.

**Не входит в scope**: pricing-страница, docs-страница, аналитика, готовые видео/GIF (только плейсхолдеры), редизайн авторизованной части и внутреннего `Header`.

## Capabilities

### New Capabilities
- `landing`: посадочная страница для неавторизованных посетителей — структура секций, i18n-контент, навигация на страницы аутентификации, отдельный лендинг-хедер.

### Modified Capabilities
_(нет — существующих специй ещё нет; вся раздел лендинга описывается как новая capability)_

## Impact

**Код**:
- `src/views/landing/ui/landing-page.tsx` — переписывается: рендерит все новые секции.
- `src/widgets/landing/hero-section/ui/hero-section.tsx` — переписывается: убирает хардкод, читает i18n, добавляет визуал.
- `src/widgets/landing/*` — новые слайсы: `landing-header`, `how-it-works-section`, `features-section`, `audience-section`, `roadmap-section`, `cta-section` (каждый — по FSD, с `ui/`, `index.ts`).
- `src/app/[locale]/page.tsx` — расширяется список scopes в `ScopedIntlProvider` для неавторизованной ветки (добавить `Landing`).
- `src/shared/langs/en.json` + `src/shared/langs/ru.json` — новая ветка `Landing` с ключами для всех секций.
- `public/landing/` — плейсхолдер hero-скриншот (`hero-editor.png` или SVG-заглушка) до появления реального GIF.

**Роутинг/данные/БД**: не затрагивается.
**Auth**: не затрагивается (лендинг рендерится в `page.tsx` только когда `user` не залогинен).
**Тесты**: unit-снапшот/render-тесты новых виджетов на минимальном уровне (что заголовок/CTA рендерятся из i18n). E2E не входит в scope этого change.
**Зависимости**: без новых npm-пакетов; используем существующие `shared/ui`, `lucide-react`, `next-intl`.
**GitHub**: ветка `feat/85-landing-redesign`, привязка к issue #85.
