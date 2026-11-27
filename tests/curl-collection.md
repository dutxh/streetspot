# Коллекция запросов Street Spot API (curl)

Перед запуском поднимите сервер:

```bash
cd app
npm install
npm run dev
```

Все команды используют базовый адрес `http://localhost:3000`.

## Проверка сервера

```bash
curl -i http://localhost:3000/api/health
```

## Чтение площадок

```bash
curl -i http://localhost:3000/api/courts
curl -i "http://localhost:3000/api/courts?surface=rubber"
curl -i --get --data-urlencode "search=парк" http://localhost:3000/api/courts
curl -i "http://localhost:3000/api/courts?sort=rating"
curl -i http://localhost:3000/api/courts/1
curl -i http://localhost:3000/api/courts/999
curl -i http://localhost:3000/api/courts/abc
```

## Создание площадки

```bash
curl -i -X POST http://localhost:3000/api/courts \
  -H "Content-Type: application/json" \
  -d '{"name":"Тестовая площадка","address":"ул. Тестовая, 1","surface":"rubber","lighting":true,"nets":false,"rating":4.2,"players":6}'
```

Ошибки валидации:

```bash
curl -i -X POST http://localhost:3000/api/courts \
  -H "Content-Type: application/json" \
  -d '{"address":"ул. Без названия, 2","surface":"asphalt","lighting":false,"nets":false}'

curl -i -X POST http://localhost:3000/api/courts \
  -H "Content-Type: application/json" \
  -d '{"name":"Плохая площадка","address":"ул. Ошибок, 3","surface":"parquet","lighting":"yes","nets":true}'

curl -i -X POST http://localhost:3000/api/courts \
  -H "Content-Type: application/json" \
  -d '{"name":"Плохое покрытие","address":"ул. Ошибок, 4","surface":"wood","lighting":true,"nets":true}'
```

## Частичное обновление

```bash
curl -i -X PATCH http://localhost:3000/api/courts/10 \
  -H "Content-Type: application/json" \
  -d '{"name":"Обновлённая площадка","rating":4.7}'

curl -i -X PATCH http://localhost:3000/api/courts/10 \
  -H "Content-Type: application/json" \
  -d '{"rating":9}'

curl -i -X PATCH http://localhost:3000/api/courts/abc \
  -H "Content-Type: application/json" \
  -d '{"name":"Что-то"}'

curl -i -X PATCH http://localhost:3000/api/courts/999 \
  -H "Content-Type: application/json" \
  -d '{"name":"Что-то"}'
```

## Удаление

```bash
curl -i -X DELETE http://localhost:3000/api/courts/10
curl -i -X DELETE http://localhost:3000/api/courts/10
curl -i -X DELETE http://localhost:3000/api/courts/abc
```

## Обработка ошибок

```bash
curl -i http://localhost:3000/api/unknown
curl -i http://localhost:3000/api/debug/error
curl -i -X POST http://localhost:3000/api/courts \
  -H "Content-Type: application/json" \
  -d '{"name": "broken",'
```

## Статические страницы

```bash
curl -i http://localhost:3000/
curl -i "http://localhost:3000/court.html?id=1"
curl -i http://localhost:3000/unknown-page
```
