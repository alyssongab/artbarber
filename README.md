# Artbarber

# Estrutura de pastas backend

```
.
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.model.js
│   │   │   └── auth.routes.js
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.model.js
│   │   │   └── user.routes.js
│   │   └── products/
│   │       ├── product.controller.js
│   │       ├── product.service.js
│   │       ├── product.model.js
│   │       └── product.routes.js
│   ├── config/
│   │   └── index.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   └── helpers.js
│   └── app.js
├── tests/
│   ├── modules/
│   │   ├── auth.test.js
│   │   └── users.test.js
├── package.json
├── .env
└── README.md
```