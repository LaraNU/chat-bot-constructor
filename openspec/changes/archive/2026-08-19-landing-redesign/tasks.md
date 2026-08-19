## 1. i18n foundation

- [x] 1.1 Удалить пустой ключ `heroSection` из `src/shared/langs/en.json` и `src/shared/langs/ru.json`
- [x] 1.2 Добавить в `src/shared/langs/en.json` ветку `Landing` с поддиректориями `header`, `hero`, `howItWorks`, `features`, `audience`, `roadmap`, `cta` (все ключи, используемые в секциях)
- [x] 1.3 Добавить зеркальную RU-версию `Landing.*` в `src/shared/langs/ru.json`, ключи 1:1 с EN
- [x] 1.4 Убедиться что `next-intl` типизация подхватывает новые ключи (запустить `tsc --noEmit`)

## 2. Assets

- [x] 2.1 Создать директорию `public/landing/`
- [x] 2.2 Положить плейсхолдер `hero-editor.svg` (простая мок-иллюстрация canvas'а редактора; фиксированное соотношение ~16:10)

## 3. Landing header widget

- [x] 3.1 Создать слайс `src/widgets/landing/landing-header/` (`ui/landing-header.tsx`, `index.ts`)
- [x] 3.2 Реализовать `LandingHeader` (client component): логотип-ссылка на `/`, якорная навигация (`#how-it-works`, `#features`, `#roadmap`) — скрыть на mobile, правая группа с `Button variant="ghost"` → `/login` и primary `Button` → `/signup`
- [x] 3.3 Sticky header (`sticky top-0 z-50`), backdrop-blur, border-bottom — по стилистике `shared/ui`
- [x] 3.4 Все копирайты — через `useTranslations('Landing.header')`, ссылки — через `@/i18n/navigation` `Link`

## 4. Hero section

- [x] 4.1 Переписать `src/widgets/landing/hero-section/ui/hero-section.tsx`: убрать хардкод, читать из `useTranslations('Landing.hero')`
- [x] 4.2 Разметка: заголовок + подзаголовок + первичный CTA (`/signup`) + вторичный CTA (`/login`) + визуал (`<Image>` из `next/image` на `public/landing/hero-editor.svg`, с осмысленным `alt` из i18n)
- [x] 4.3 Добавить id `hero` секции (не обязательно для навигации, но полезно для anchor-теста)

## 5. How-it-works section

- [x] 5.1 Создать слайс `src/widgets/landing/how-it-works-section/` (`ui/how-it-works-section.tsx`, `index.ts`)
- [x] 5.2 Секция с id `how-it-works`, заголовок из `Landing.howItWorks.title`, подзаголовок из `Landing.howItWorks.subtitle`
- [x] 5.3 Рендерить 3–4 пронумерованных шага (create bot → design flow → publish → chat) из массива в i18n (`Landing.howItWorks.steps`)
- [x] 5.4 Каждый шаг: номер, заголовок, описание — оформить как карточки на grid (2 колонки desktop, 1 mobile)

## 6. Features section

- [x] 6.1 Создать слайс `src/widgets/landing/features-section/`
- [x] 6.2 Секция с id `features`; заголовок и подзаголовок из i18n
- [x] 6.3 Отрендерить 4–6 фич (visual editor, node types, one-click publish, drafts/published, per-user isolation, RU/EN UI), каждая — иконка (`lucide-react`), заголовок, описание
- [x] 6.4 Обеспечить, что список фич соответствует реально реализованным возможностям (см. `docs/roadmap.md` и README) — никаких «enterprise ready», «team collaboration», если это не реализовано

## 7. Audience section

- [x] 7.1 Создать слайс `src/widgets/landing/audience-section/`
- [x] 7.2 Отрендерить 3 сегмента: solo makers, small agencies, internal company teams (заголовок + описание из i18n)
- [x] 7.3 Оформить карточками с иконками; grid 3 колонки desktop, 1 mobile

## 8. Roadmap section

- [x] 8.1 Создать слайс `src/widgets/landing/roadmap-section/`
- [x] 8.2 Секция с id `roadmap`
- [x] 8.3 Три группы: Available now / In progress / Planned — списки пунктов из `Landing.roadmap.available[]`, `Landing.roadmap.inProgress[]`, `Landing.roadmap.planned[]`
- [x] 8.4 Добавить комментарий в коде виджета: «Keep copy in sync with docs/roadmap.md»

## 9. CTA section

- [x] 9.1 Создать слайс `src/widgets/landing/cta-section/`
- [x] 9.2 Заголовок + подзаголовок + primary CTA → `/signup`

## 10. Landing page composition

- [x] 10.1 Переписать `src/views/landing/ui/landing-page.tsx`: убрать `ScopedIntlProvider` (перенесём scope на уровень `app/[locale]/page.tsx`) и собрать секции в порядке: `LandingHeader`, `<main>` (`HeroSection`, `HowItWorksSection`, `FeaturesSection`, `AudienceSection`, `RoadmapSection`, `CtaSection`), `Footer`
- [x] 10.2 Обновить public API `src/views/landing/index.ts` (если добавились экспорты)
- [x] 10.3 В `src/app/[locale]/page.tsx` для ветки неавторизованного пользователя обернуть `<LandingPage />` в `<ScopedIntlProvider scopes={['Landing']}>` (единый scope на весь лендинг)

## 11. Tests

- [x] 11.1 Render-тест `LandingHeader`: проверить наличие двух CTA-ссылок с корректными `href`, наличие anchor-навигации, тексты из мока i18n
- [x] 11.2 Render-тест `HeroSection`: заголовок из i18n, primary CTA ведёт на `/signup`, `<img>`/`<Image>` присутствует с непустым alt
- [x] 11.3 Render-тест `FeaturesSection`: рендерится 4–6 карточек
- [x] 11.4 Render-тест `RoadmapSection`: три группы присутствуют
- [x] 11.5 Прогнать `npm test` — все тесты зелёные

## 12. Verification

- [x] 12.1 Запустить `npm run dev`, открыть `/en` и `/ru` неавторизованным, визуально проверить все секции, ссылки и переводы
- [x] 12.2 Проверить mobile-верстку (DevTools 360px): нет горизонтального скролла, header корректно себя ведёт
- [x] 12.3 Проверить, что авторизованный пользователь на `/` по-прежнему видит дашборд, а не лендинг
- [x] 12.4 Прогнать `npm run lint` и `tsc --noEmit`
- [x] 12.5 Запустить `openspec validate landing-redesign --strict` — проходит без ошибок

## 13. Wrap-up

- [ ] 13.1 Обновить PR description: ссылка на issue #85, скриншоты RU/EN, чек-лист приёмки
- [ ] 13.2 Отметить в PR: «hero visual — плейсхолдер, реальный GIF/скриншот — follow-up»
