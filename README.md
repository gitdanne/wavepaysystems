# WaveCoin Banking App (Full-stack Version)

Полноценная версия WaveCoin с бэкендом на Express.js и базой данных MongoDB.

## Как запустить локально

1. Установите MongoDB локально или создайте кластер на [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Скопируйте `.env.example` в `.env` и укажите ваш `MONGODB_URI`
3. Установите зависимости:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```
4. Инициализируйте мок-аккаунты (создаст 5 тестовых профилей):
   ```bash
   npm run seed
   ```
5. Запустите в режиме разработки:
   ```bash
   # Терминал 1 (Бэкенд)
   npm run dev

   # Терминал 2 (Фронтенд)
   cd client
   npm run dev
   ```

## Как развернуть на Render (Деплой)

1. Загрузите папку `deploy` в отдельный репозиторий на GitHub.
2. Зарегистрируйтесь на [Render](https://render.com/).
3. Нажмите **New** -> **Blueprint**.
4. Подключите ваш GitHub репозиторий. Render автоматически найдет `render.yaml`.
5. В дашборде Render вам нужно будет указать **Environment Variable** `MONGODB_URI` (строка подключения к вашему кластеру MongoDB Atlas).
6. Дождитесь окончания деплоя (выполнится `npm run build:client` и запустится сервер).

Ваш проект доступен по ссылке от Render!
