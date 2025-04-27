const swaggerUi = require('swagger-ui-express');

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
          '201': { description: "Користувача створено" },
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
          '200': { description: "Оновлено" },
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
          '200': { description: "Успішний логін" },
        },
      },
    },
    "/customers/customer": {
      get: {
        tags: ["Customers"],
        summary: "Отримати поточного користувача",
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: "Дані користувача" },
        },
      },
    },
    "/movies": {
      get: {
        tags: ["Movies"],
        summary: "Отримати всі фільми",
        responses: {
          '200': { description: "Список фільмів" },
        },
      },
    },
    "/movies/{movieId}": {
      get: {
        tags: ["Movies"],
        summary: "Отримати фільм за ID",
        parameters: [
          { name: "movieId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          '200': { description: "Дані фільму" },
        },
      },
    },
    "/movies/genres": {
      get: {
        tags: ["Movies"],
        summary: "Отримати жанри фільмів",
        responses: {
          '200': { description: "Жанри" },
        },
      },
    },
    "/movies/popular": {
      get: {
        tags: ["Movies"],
        summary: "Отримати популярні фільми",
        responses: {
          '200': { description: "Популярні фільми" },
        },
      },
    },
    "/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "Отримати улюблені фільми користувача",
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: "Список улюблених фільмів" },
        },
      },
    },
    "/favorites/{movieId}": {
      post: {
        tags: ["Favorites"],
        summary: "Додати фільм до улюблених",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "movieId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          '200': { description: "Додано до улюблених" },
        },
      },
      delete: {
        tags: ["Favorites"],
        summary: "Видалити фільм з улюблених",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          '200': { description: "Видалено" },
        },
      },
    },
    "/movies-in-cinema": {
      get: {
        tags: ["MoviesInCinema"],
        summary: "Перегляд усіх фільмів в прокаті",
        responses: {
          '200': { description: "Список фільмів в прокаті" },
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
          '201': { description: "Додано фільм" },
        },
      },
    },
    "/movies-in-cinema/{movieId}/sessions": {
      post: {
        tags: ["MoviesInCinema"],
        summary: "Додати сеанс (лише Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "movieId", in: "path", required: true, schema: { type: "string" } },
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
          '201': { description: "Додано сеанс" },
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
          '200': {
            description: "Список сеансів за обраною датою",
          },
        },
      },
    },
    "/movies-in-cinema/{movieId}/sessions/{sessionId}": {
      put: {
        tags: ["MoviesInCinema"],
        summary: "Редагувати сеанс (лише Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "movieId", in: "path", required: true, schema: { type: "string" } },
          { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
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
          '200': { description: "Сеанс оновлено" },
        },
      },
      delete: {
        tags: ["MoviesInCinema"],
        summary: "Видалити сеанс (лише Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "movieId", in: "path", required: true, schema: { type: "string" } },
          { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          '200': { description: "Сеанс видалено" },
        },
      },
    },
    "/movies-in-cinema/{movieId}/sessions/{sessionId}/book": {
      post: {
        tags: ["MoviesInCinema"],
        summary: "Забронювати місце на сеанс",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "movieId", in: "path", required: true, schema: { type: "string" } },
          { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
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
          '200': { description: "Місце заброньовано" },
        },
      },
    },
    "/movies-in-cinema/{movieId}/sessions/{sessionId}/seats": {
      get: {
        tags: ["MoviesInCinema"],
        summary: "Отримати доступні місця на сеанс",
        parameters: [
          { name: "movieId", in: "path", required: true, schema: { type: "string" } },
          { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          '200': { description: "Список доступних місць" },
        },
      },
    },
    "/tickets/me": {
      get: {
        tags: ["Tickets"],
        summary: "Отримати квитки користувача",
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: "Список квитків" },
        },
      },
    },
    "/tickets/{ticketId}": {
      get: {
        tags: ["Tickets"],
        summary: "Отримати квиток за ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "ticketId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          '200': { description: "Деталі квитка" },
        },
      },
      delete: {
        tags: ["Tickets"],
        summary: "Видалити квиток",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "ticketId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          '200': { description: "Квиток видалено" },
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
      UpdateCustomer: { 
        type: "object",
        properties: {
          email: { type: "string", example: "newemail@example.com" },
          password: { type: "string", example: "newpassword123" },
          firstName: { type: "string", example: "John" },
          birthdate: { type: "string", format: "date", example: "2000-01-01" },
        },
      },
      MovieInCinema: { 
        type: "object",
        required: ["movieId"],
        properties: {
          movieId: { type: "integer", example: 550 },
          sessions: {
            type: "array",
            items: { $ref: "#/components/schemas/Session" },
          },
        },
      },
      Session: {  
        type: "object",
        properties: {
          dateTime: {
            type: "string",
            format: "date-time",
            example: "2025-04-27T18:30:00Z"
          },
          price: { 
            type: "number",
            format: "float",
            example: 150.00
          },
          seats: {
            type: "array",
            items: { $ref: "#/components/schemas/Seat" }
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
  }
};

module.exports = { swaggerDocument, swaggerUi };
