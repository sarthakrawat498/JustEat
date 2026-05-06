# 📌 JustEat Food Ordering Application — Sprint Plan

This document outlines the sprint-wise breakdown of features and progress for the JustEat Food Ordering Application.

---

# 🟢 Sprint 1 — Authentication & Restaurant Browsing

## 🎯 Objective

Enable users to authenticate and browse restaurants.

## 👤 User Capabilities

- Register / Login
- View restaurants by location
- View restaurant details

## 🔧 Backend

- JWT Authentication
- User Entity
- Restaurant Entity
- APIs:
  - GET /restaurants
  - GET /restaurants/{id}

## 🎨 Frontend

- Login/Register page
- Location selection
- Restaurant listing page
- Restaurant detail page

## 🔗 Integration

- Store JWT token after login
- Fetch restaurants using API
- Display based on selected location

## ✅ Outcome

User logs in → views restaurants → opens details

---

# 🔵 Sprint 2 — Menu & Owner Management

## 🎯 Objective

Enable menu viewing and restaurant management by owners.

## 👤 User Capabilities

- View restaurant menu

## 👨‍🍳 Owner Capabilities

- Create restaurant
- Add menu items
- Manage basic restaurant data

## 🔧 Backend

- MenuItem Entity
- APIs:
  - POST /restaurants (OWNER)
  - POST /menu-items
  - GET /restaurants/{id}/menu

## 🎨 Frontend

### User Side:

- Menu display on restaurant page

### Owner Side:

- Create restaurant form
- Add menu item form
- Basic owner dashboard

## 🔗 Integration

- Owner creates restaurant → visible in listing
- Menu items added → visible to customers

## ✅ Outcome

Owner adds menu → Customer can view menu

---

# 🟡 Sprint 3 — Cart (Core Flow)

## 🎯 Objective

Enable users to build and manage their cart.

## 👤 User Capabilities

- Add items to cart from restaurant detail page
- Update item quantity in cart (+ / −)
- Remove individual items
- View cart with live total
- Cart persists across page refreshes

## 🔧 Backend

- Cart Entity
- CartItem Entity
- APIs:
  - `POST /cart/add-item` — add item with quantity
  - `PATCH /cart/update-item` — update item quantity (0 removes item)
  - `DELETE /cart/remove-item/{menuItemId}` — remove specific item
  - `GET /cart` — fetch cart with restaurant name, total, and items

## 🎨 Frontend

- **`cartApi.js`** — API layer for all cart endpoints
- **`CartContext.jsx`** — global cart state with `addToCart`, `updateCartItem`, `removeCartItem`, `fetchCart`, `clearCart`, and `cartItemCount`; auto-fetches on mount for CUSTOMER role
- **`RestaurantDetail.jsx`** — "+ Add" button per menu item with loading spinner, "✓ Added!" flash, and "N in cart" badge; only visible to CUSTOMER
- **`Navbar.jsx`** — 🛒 cart icon with live orange badge showing item count; only visible to CUSTOMER
- **`Cart.jsx`** — full cart page with item list, quantity controls, order summary, and total

## 🔗 Integration

- Add to cart updates backend, then re-fetches cart state
- Cart badge in navbar reflects live count
- Cross-restaurant cart conflict surfaces backend error via alert
- `CartProvider` wraps app in `main.jsx`
- `/cart` route added as a `PrivateRoute`

## ✅ Outcome

User adds items from any restaurant → cart updates in real time → views and manages cart via dedicated cart page

---

# 🔴 Sprint 4 — Order Flow

## 🎯 Objective

Enable users to place and track orders.

## 👤 User Capabilities

- Place order
- View order history

## 🔧 Backend

- Order Entity
- OrderItem Entity
- APIs:
  - Create order
  - Get user orders

## 🎨 Frontend

- Checkout page
- Order confirmation page
- Order history page

## 🔗 Integration

- Cart → Order conversion
- Cart clears after order

## ✅ Outcome

User places order and views it in history

---

# 🟣 Sprint 5 — Enhancements

## 🎯 Objective

Add advanced features on top of the core order flow to improve user experience, discoverability, and owner insights.

## 👤 Customer Capabilities

- Rate completed orders (1–5 stars)
- Search restaurants by keyword, location, and cuisine type
- View "Today's Special" highlighted items on restaurant pages
- See 🔥 Mostly Ordered badges on popular menu items
- Repeat a past order (with unavailable / price-changed reporting)
- Save favourite cuisines and dietary restrictions as preferences
- Receive personalised restaurant recommendations based on preferences and ratings
- Reset forgotten password via email link

## 👨‍🍳 Owner Capabilities

- Mark menu items as Chef's Special via a quick-toggle button
- See 🔥 Mostly Ordered badges on popular items in the management view

## 🔧 Backend

- **Ratings** — `POST /orders/{id}/rate`; updates restaurant average rating using rolling average
- **Repeat Order** — `POST /orders/{id}/repeat`; re-populates cart with availability and price-change reporting
- **Order date** — `createdAt` added to `OrderResponse` via `BaseEntity`
- **Restaurant Search** — `GET /restaurants/search?keyword=&location=&cuisine=` using JPQL custom query
- **Today's Special / Chef's Special** — `isSpecial` flag on `MenuItem`; fixed Jackson serialisation with `@JsonProperty("isSpecial")`
- **Mostly Ordered** — `orderCount` incremented at checkout; `GET /restaurants/{id}/menu` enriches response with live `SUM(quantity)` from `OrderItem` table and computes `mostlyOrdered` flag (items at or above average order count)
- **User Preferences** — `UserPreference` entity; `PUT /users/me/preferences`, `GET /users/me/preferences`
- **Recommendations** — `GET /users/me/recommendations`; scores open restaurants by cuisine match (×2) + rating, returns top 10; falls back to top-rated if no preferences saved
- **Forgot / Reset Password** — tokenised email link with 15-minute expiry and BCrypt-hashed token storage
- **Swagger UI** — remapped to `/api-docs` via `springdoc.swagger-ui.path`
- **Docker** — single-stage `Dockerfile` + `docker-compose.yml` with PostgreSQL service and full environment variable mapping

## 🎨 Frontend

- **`ForgotPassword.jsx`** / **`ResetPassword.jsx`** — full forgot/reset password flow
- **`Home.jsx`** — search bar + location and cuisine dropdowns (debounced 350 ms); "⭐ Recommended for You" horizontal-scroll banner for customers
- **`RestaurantDetail.jsx`** — "Today's Special" horizontal-scroll banner; 🔥 Mostly Ordered badge on both carousel and regular menu items
- **`OrderHistory.jsx`** — order date display, repeat order with `RepeatModal`, `StarRating` component (only on COMPLETED + unrated orders)
- **`ManageRestaurant.jsx`** — ⭐ quick-toggle Special button per item; 🔥 Mostly Ordered badge; removed Chef's Special checkbox from add/edit form
- **`Profile.jsx`** — "My Preferences" card with cuisine chips (orange) and dietary chips (green), save handler with success toast
- **`userApi.js`** — `getPreferences`, `savePreferences`, `getRecommendations`
- **`orderApi.js`** — `repeatOrder`, `rateOrder`
- **`restaurantApi.js`** — `searchRestaurants`
- **`authService.js`** — `forgotPassword`, `resetPassword`

## 🔗 Integration

- Search parameters pass `keyword`/`location`/`cuisine` to backend
- Preference chips in Profile hit `PUT /users/me/preferences`
- Recommendations fetch on Home mount and link directly to the restaurant page
- `mostlyOrdered` flag calculated server-side from live `OrderItem` aggregation — works retroactively on existing data

## ✅ Outcome

Customers get a personalised, feature-rich experience with search, recommendations, ratings, repeat orders, and preference management. Owners can identify popular dishes and manage specials effortlessly.

---

# 🧠 Current Progress

- ✅ Sprint 1 — Auth & Restaurant Browsing (Frontend + Backend)
- ✅ Sprint 2 — Menu & Owner Management (Frontend + Backend)
- ✅ Sprint 3 — Cart (Frontend + Backend)
- ✅ Sprint 4 — Order Flow (Frontend + Backend)
- ✅ Sprint 5 — Enhancements (Frontend + Backend)

---

# 🚀 Next Step

👉 Begin Sprint 5 (Enhancements — Ratings, Search/Filter, Owner Dashboard improvements)

---

# 📌 Tech Stack

- Frontend: React
- Backend: Spring Boot
- Database: PostgreSQL
- Auth: JWT

---

# 📎 Notes

- Role-based access implemented (Customer vs Owner)
- APIs secured with JWT
- Frontend integrated with backend for all completed features
