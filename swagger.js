const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Cinema API",
    version: "1.0.0",
    description: "API",
  },
  servers: [
    {
      url: "https://soft-serve-practice-back.vercel.app/api",
    },
  ],
  tags: [
    { name: "Customers" },
    { name: "Movies" },
    { name: "Favorites" },
    { name: "MoviesInCinema" },
    { name: "Tickets" },
  ],
  paths: {
    "/customers": {
      post: {
        tags: ["Customers"],
        summary: "Реєстрація нового користувача",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Customer" },
            },
          },
        },
        responses: {
          201: { description: "Користувача створено" },
        },
      },
      put: {
        tags: ["Customers"],
        summary: "Редагувати дані користувача",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCustomer" },
            },
          },
        },
        responses: {
          200: { description: "Оновлено" },
        },
      },
    },
    "/customers/login": {
      post: {
        tags: ["Customers"],
        summary: "Логін користувача (JWT токен)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Login" },
            },
          },
        },
        responses: {
          200: { description: "Успішний логін" },
        },
      },
    },
    "/customers/password": {
      put: {
        tags: ["Customers"],
        summary: "Оновити пароль користувача",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePassword" },
            },
          },
        },
        responses: {
          200: {
            description: "Пароль успішно оновлено",
          },
          400: {
            description: "Помилка: старий пароль неправильний або невірні дані",
          },
        },
      },
    },
    "/customers/customer": {
      get: {
        tags: ["Customers"],
        summary: "Отримати поточного користувача",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Дані користувача" },
        },
      },
    },
    "/movies": {
      get: {
        tags: ["Movies"],
        summary: "Отримати всі фільми",
        responses: {
          200: { description: "Список фільмів" },
        },
      },
    },
    "/movies/{movieId}": {
      get: {
        tags: ["Movies"],
        summary: "Отримати фільм за ID",
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Дані фільму" },
        },
      },
    },
    "/movies/genres": {
      get: {
        tags: ["Movies"],
        summary: "Отримати жанри фільмів",
        responses: {
          200: { description: "Жанри" },
        },
      },
    },
    "/movies/popular": {
      get: {
        tags: ["Movies"],
        summary: "Отримати популярні фільми",
        responses: {
          200: { description: "Популярні фільми" },
        },
      },
    },
    "/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "Отримати улюблені фільми користувача",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Список улюблених фільмів" },
        },
      },
    },
    "/favorites/{movieId}": {
      post: {
        tags: ["Favorites"],
        summary: "Додати фільм до улюблених",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Додано до улюблених" },
        },
      },
      delete: {
        tags: ["Favorites"],
        summary: "Видалити фільм з улюблених",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Видалено" },
        },
      },
    },
    "/movies-in-cinema": {
      get: {
        tags: ["MoviesInCinema"],
        summary: "Перегляд усіх фільмів в прокаті",
        responses: {
          200: { description: "Список фільмів в прокаті" },
        },
      },
      post: {
        tags: ["MoviesInCinema"],
        summary: "Додати новий фільм у прокат (лише Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MovieInCinema" },
            },
          },
        },
        responses: {
          201: { description: "Додано фільм" },
        },
      },
    },
    "/movies-in-cinema/{movieId}": {
      get: {
        tags: ["MoviesInCinema"],
        summary: "Отримати фільм у прокаті за ID",
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "language",
            in: "query",
            required: false,
            schema: {
              type: "string",
              default: "en-US",
              example: "uk-UA",
              description: "Мова результату (наприклад: uk-UA )",
            },
          },
        ],
        responses: {
          200: {
            description: "Дані фільму в прокаті",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MovieInCinema" },
              },
            },
          },
          404: {
            description: "Фільм не знайдено",
          },
        },
      },
      delete: {
        tags: ["MoviesInCinema"],
        summary: "Видалити фільм з прокату (лише Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Фільм видалено з прокату",
          },
          404: {
            description: "Фільм не знайдено",
          },
        },
      },
    },
    "/movies-in-cinema/{movieId}/sessions": {
      post: {
        tags: ["MoviesInCinema"],
        summary: "Додати сеанс (лише Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SessionAdd" },
            },
          },
        },
        responses: {
          201: { description: "Додано сеанс" },
        },
      },
      get: {
        tags: ["MoviesInCinema"],
        summary: "Отримати всі сеанси фільму за конкретною датою",
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID фільму",
          },
          {
            name: "date",
            in: "query",
            required: true,
            schema: { type: "string", format: "date", example: "2025-05-11" },
            description: "Дата для пошуку сеансів у форматі YYYY-MM-DD",
          },
        ],
        responses: {
          200: {
            description: "Список сеансів за обраною датою",
          },
        },
      },
    },
    "/movies-in-cinema/{movieId}/sessions/{sessionId}": {
      get: {
        tags: ["MoviesInCinema"],
        summary: "Отримати сеанс за ID",
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Деталі сеансу",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" },
              },
            },
          },
        },
      },
      put: {
        tags: ["MoviesInCinema"],
        summary: "Редагувати сеанс (лише Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Session" },
            },
          },
        },
        responses: {
          200: { description: "Сеанс оновлено" },
        },
      },
      delete: {
        tags: ["MoviesInCinema"],
        summary: "Видалити сеанс (лише Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Сеанс видалено" },
        },
      },
    },
    "/movies-in-cinema/{movieId}/sessions/{sessionId}/book": {
      post: {
        tags: ["MoviesInCinema"],
        summary: "Забронювати місце на сеанс",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Book" },
            },
          },
        },
        responses: {
          200: { description: "Місце заброньовано" },
        },
      },
    },
    "/movies-in-cinema/{movieId}/sessions/{sessionId}/seats": {
      get: {
        tags: ["MoviesInCinema"],
        summary: "Отримати доступні місця на сеанс",
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Список доступних місць" },
        },
      },
    },
    "/tickets/me": {
      get: {
        tags: ["Tickets"],
        summary: "Отримати квитки користувача",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Список квитків" },
        },
      },
    },
    "/tickets/{ticketId}": {
      get: {
        tags: ["Tickets"],
        summary: "Отримати квиток за ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Деталі квитка" },
        },
      },
      delete: {
        tags: ["Tickets"],
        summary: "Видалити квиток",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Квиток видалено" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Customer: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
      },
      Login: {
        type: "object",
        properties: {
          loginOrEmail: { type: "string" },
          password: { type: "string" },
        },
      },
      UpdatePassword: {
        type: "object",
        properties: {
          password: {
            type: "string",
            example: "123450987",
            description: "Старий пароль користувача",
          },
          newPassword: {
            type: "string",
            example: "1234509876",
            description: "Новий пароль користувача",
          },
        },
      },
      UpdateCustomer: {
        type: "object",
        properties: {
          email: { type: "string", example: "newemail@example.com" },
          firstName: { type: "string", example: "John" },
          birthdate: { type: "string", format: "date", example: "2000-01-01" },
        },
      },
      MovieInCinema: {
        type: "object",
        required: ["movieId"],
        properties: {
          movieId: { type: "integer", example: 550 },
        },
      },
      Session: {
        type: "object",
        properties: {
          dateTime: {
            type: "string",
            format: "date-time",
            example: "2025-04-27T18:30:00Z",
          },
          price: {
            type: "number",
            format: "float",
            example: 150.0,
          },
          seats: {
            type: "array",
            items: { $ref: "#/components/schemas/Seat" },
          },
        },
      },
      SessionAdd: {
        type: "object",
        properties: {
          dateTime: {
            type: "string",
            format: "date-time",
            example: "2025-04-27T18:30:00Z",
          },
          price: {
            type: "number",
            format: "float",
            example: 150.0,
          },
          seats: {
            type: "array",
            items: { type: "number", example: 5 },
          },
        },
      },
      Seat: {
        type: "object",
        properties: {
          seatNumber: { type: "integer", example: 12 },
          isBooked: { type: "boolean", example: false },
        },
      },
      Book: {
        type: "object",
        properties: {
          seatNumber: { type: "integer", example: 4 },
        },
      },
    },
  },
};

module.exports = { swaggerDocument, swaggerUi };
