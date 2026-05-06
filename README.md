# 🍔 JustEat — Food Ordering Application

A full-stack food ordering platform where customers can browse restaurants, manage their cart, place orders, rate experiences, and receive personalised recommendations — while restaurant owners manage their menus, track orders, and monitor popular dishes.

---

## 📁 Project Structure

```
JustEat/
├── Backend/          # Spring Boot REST API
│   ├── src/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── pom.xml
├── Frontend/         # React + Vite SPA
│   ├── src/
│   └── package.json
└── Sprints.md
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 21 + Spring Boot 3 | REST API framework |
| Spring Security + JWT | Authentication & authorisation |
| PostgreSQL | Relational database |
| Spring Data JPA / Hibernate | ORM & database access |
| Cloudinary | Image hosting |
| JavaMailSender (Gmail SMTP) | Password reset emails |
| SpringDoc OpenAPI (Swagger) | API documentation |
| Docker + Docker Compose | Containerisation |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | SPA framework & build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Tailwind CSS | Utility-first styling |
| Context API | Global state (Auth, Cart, Theme) |

---

## 🚀 Getting Started

### Prerequisites
- Java 21
- Maven 3.9+
- Node.js 18+
- PostgreSQL 16 (or Docker)

---

### Backend — Local Setup

1. **Create the database**
   ```sql
   CREATE DATABASE justeat;
   ```

2. **Configure `application.properties`**
   The file is located at `Backend/src/main/resources/application.properties`. Update credentials if your Postgres setup differs from the defaults.

3. **Run the application**
   ```bash
   cd Backend
   mvn spring-boot:run
   ```
   The API starts on **`http://localhost:8090`**.

4. **Swagger UI**
   ```
   http://localhost:8090/api-docs
   ```

---

### Backend — Docker Setup

```bash
cd Backend

# 1. Build the JAR
mvn package -DskipTests

# 2. Start Postgres + Backend
docker compose up --build
```

The compose file starts a PostgreSQL container and the Spring Boot app, wiring them together automatically. All environment variables are sourced from `application.properties` values.

---

### Frontend — Local Setup

```bash
cd Frontend
npm install
npm run dev
```

The app starts on **`http://localhost:5173`**.

To build for production:
```bash
npm run build
```

---

## 🔑 Environment Variables (Backend)

All values are set in `Backend/src/main/resources/application.properties` and mirrored as environment variables in `docker-compose.yml`.

| Property | Description |
|---|---|
| `spring.datasource.url` | JDBC URL for PostgreSQL |
| `spring.datasource.username` | DB username |
| `spring.datasource.password` | DB password |
| `jwt.secret` | HMAC secret for signing JWTs |
| `jwt.expiration` | Token lifetime in milliseconds |
| `cloudinary.cloud-name` | Cloudinary account name |
| `cloudinary.api-key` | Cloudinary API key |
| `cloudinary.api-secret` | Cloudinary API secret |
| `frontend.url` | Frontend base URL (used in reset-password emails) |
| `spring.mail.username` | Gmail address for sending emails |
| `spring.mail.password` | Gmail app password |

---

## 📡 API Overview

| Domain | Base Path | Access |
|---|---|---|
| Auth | `/auth` | Public |
| Users | `/users` | Authenticated |
| Restaurants | `/restaurants` | Public / Owner |
| Owner Restaurant | `/owner/restaurants` | Owner only |
| Menu Items | `/restaurants/{id}/menu` | Public / Owner |
| Cart | `/cart` | Customer only |
| Orders | `/orders` | Customer only |
| Owner Orders | `/owner/orders` | Owner only |
| Image Upload | `/upload` | Authenticated |

Full interactive docs available at `http://localhost:8090/api-docs` after starting the backend.

---

## 👤 User Roles

### Customer
- Register / Login / Forgot & Reset Password
- Browse and search restaurants (by keyword, location, cuisine)
- View restaurant menus with Today's Special and 🔥 Mostly Ordered badges
- Add / update / remove items in cart
- Checkout and place orders
- View order history with date and status
- Repeat a past order
- Rate completed orders (1–5 stars)
- Save cuisine and dietary preferences
- Receive personalised restaurant recommendations

### Owner
- Create and manage restaurants
- Add, edit, delete menu items
- Toggle item availability and mark items as Chef's Special
- View incoming orders and advance their status (PENDING → PREPARING → READY → COMPLETED)
- See 🔥 Mostly Ordered badges on popular items

---

## ✨ Key Features

| Feature | Details |
|---|---|
| JWT Auth | Access tokens with role-based route protection |
| Password Reset | Tokenised email link, 15-minute expiry |
| Restaurant Search | Keyword + location + cuisine filters with debounced input |
| Today's Special | Horizontal-scroll banner on restaurant page |
| Mostly Ordered | Live calculation from all historical OrderItems; badge on popular dishes |
| Star Rating | 1–5 stars on completed orders; updates restaurant average in real time |
| Repeat Order | Re-adds past order items to cart; reports unavailable/price-changed items |
| Preferences | Save favourite cuisines + dietary restrictions |
| Recommendations | Scored by cuisine match (×2) + restaurant rating; fallback to top-rated |
| Dark Mode | Theme toggle persisted across sessions |
| Image Upload | Cloudinary integration for restaurants and profile pictures |
| Swagger UI | Full API docs at `/api-docs` |
| Docker | Single-stage Dockerfile + Compose with Postgres and Spring Boot |

---

## 🗂️ Sprint Summary

| Sprint | Theme | Status |
|---|---|---|
| Sprint 1 | Auth & Restaurant Browsing | ✅ Complete |
| Sprint 2 | Menu & Owner Management | ✅ Complete |
| Sprint 3 | Cart | ✅ Complete |
| Sprint 4 | Order Flow | ✅ Complete |
| Sprint 5 | Enhancements (Ratings, Search, Recommendations, Specials, Popularity) | ✅ Complete |

---

## 📂 Frontend Pages

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | Forgot Password | Public |
| `/reset-password` | Reset Password | Public |
| `/` | Home (restaurant listing + recommendations) | Customer |
| `/restaurant/:publicId` | Restaurant Detail + Menu | Customer |
| `/cart` | Cart | Customer |
| `/orders` | Order History | Customer |
| `/profile` | Profile + Preferences | Authenticated |
| `/owner-dashboard` | Owner Dashboard | Owner |
| `/create-restaurant` | Create Restaurant | Owner |
| `/manage/:publicId` | Manage Restaurant & Menu | Owner |
| `/owner-orders` | Owner Orders | Owner |
