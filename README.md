# LocalServe - Local Service Marketplace Backend

> **B.Tech CSE Final Year / Capstone Viva Project**  
> A scalable, modular RESTful backend built with **Node.js, Express.js, MongoDB Atlas, Socket.io, and Firebase Cloud Messaging**.

---

## 1. Project Overview

**LocalServe** is an on-demand hyperlocal service marketplace backend connecting local residents with verified skilled service professionals (electricians, plumbers, carpenters, technicians, cleaners, etc.). 

The platform enables:
- **Customers**: To discover nearby services based on geolocation, book appointments, track real-time booking progress, make simulated payments, chat with service providers, and post ratings & reviews.
- **Service Providers**: To list their offerings with hourly/fixed rates, set availability, manage customer booking lifecycles, and communicate via real-time chat.
- **Administrators**: To verify service provider credentials, manage disputes, and oversee marketplace operations.

---

## 2. Problem Statement

In local communities, finding reliable, trustworthy, and proximate service professionals is often fragmented and dependent on word-of-mouth. Traditional directories lack real-time status tracking, automated booking confirmations, role-based security, and verified ratings. **LocalServe** solves this problem by providing a centralized backend with:
- Strict **Role-Based Access Control (RBAC)** separating Customers, Providers, and Admins.
- **Geospatial & Text-based service discovery** using mathematical proximity calculation (Haversine formula).
- **Real-time updates** powered by Socket.io.
- **Automated push notifications** using Firebase Cloud Messaging (with a built-in zero-crash mock fallback for offline viva demonstrations).
- Clean audit trails for payments, disputes, and reviews.

---

## 3. Technologies Used

| Technology | Purpose |
|---|---|
| **Node.js (v18+)** | Asynchronous JavaScript runtime environment |
| **Express.js (v5)** | REST API routing and HTTP server framework |
| **MongoDB Atlas / Mongoose** | NoSQL cloud database & object document modeling |
| **JSON Web Tokens (JWT)** | Stateless authentication and session authorization |
| **bcrypt** | Secure one-way salt hashing for user passwords |
| **Socket.io** | Bi-directional WebSocket communication for live booking/chat updates |
| **Firebase Admin SDK** | Cloud Messaging (FCM) for push notifications |
| **CORS / Dotenv** | Cross-Origin Resource Sharing & Environment variable configuration |

---

## 4. Folder Structure

```
LocalServe(Backend_Project)/
├── config/
│   └── db.js                    # MongoDB Atlas connection setup
├── controllers/
│   ├── adminController.js       # Provider verification & dispute resolution
│   ├── authController.js        # User registration & login with JWT
│   ├── bookingController.js     # Booking creation, lifecycle transitions
│   ├── chatController.js        # Chat conversations & message history
│   ├── geolocationController.js # Haversine distance nearby search & text query
│   ├── notificationController.js# Push notification endpoint
│   ├── paymentController.js     # Simulated payment record tracking
│   ├── providerController.js    # Provider profiles & service listings
│   ├── reviewController.js     # Ratings, feedback, & average score updates
│   └── serviceController.js     # Service catalogue CRUD operations
├── middleware/
│   ├── authMiddleware.js        # JWT protect & role-based authorize middleware
│   └── errorMiddleware.js       # 404 handler & centralized error formatting
├── models/
│   ├── Booking.js               # Booking schema (customer, provider, service)
│   ├── Chat.js                  # Conversation and chat messages schema
│   ├── Dispute.js               # Customer/Provider dispute filing & status
│   ├── Payment.js               # Payment transaction history
│   ├── Review.js                # Customer reviews (1-5 scale)
│   ├── Service.js               # Services catalogue with lat/lng coordinates
│   └── User.js                  # Unified user schema (customer/provider/admin)
├── postman/
│   ├── LocalServe.postman_collection.json   # Ready-to-import Postman collection
│   └── LocalServe.postman_environment.json  # Environment variables configuration
├── routes/
│   ├── adminRoutes.js           # /api/admin
│   ├── authRoutes.js            # /api/auth
│   ├── bookingRoutes.js         # /api/bookings
│   ├── chatRoutes.js            # /api/chats
│   ├── geolocationRoutes.js     # /api/geolocation
│   ├── notificationRoutes.js    # /api/notifications
│   ├── paymentRoutes.js         # /api/payments
│   ├── providerRoutes.js        # /api/providers
│   ├── reviewRoutes.js          # /api/reviews
│   ├── serviceRoutes.js         # /api/services
│   └── userRoutes.js            # /api/users
├── services/
│   └── firebaseService.js       # FCM Push Notification Service with mock mode
├── socket/
│   └── socketHandler.js         # Socket.io connection & room-based event emitter
├── utils/
│   └── generateToken.js         # JWT signing helper
├── .env                         # Secret environment keys (git-ignored)
├── .env.example                 # Template for required environment variables
├── package.json                 # Project dependencies & scripts
└── server.js                    # Express + HTTP Server + Socket.io entrypoint
```

---

## 5. Database Models & Schema Design

### 1. User Model (`User.js`)
*Represents all platform actors: Customers, Providers, and Administrators.*
- `name`: String (Required, trimmed)
- `email`: String (Required, unique, lowercase)
- `password`: String (Hashed with bcrypt, min 6 chars)
- `phone`: String
- `role`: Enum `['customer', 'provider', 'admin']` (Default: `'customer'`)
- `location`: String
- `bio`: String (Provider bio / experience summary)
- `serviceCategories`: Array of Strings
- `isVerified`: Boolean (Admin-controlled provider verification, default `false`)
- `rating`: Number (Aggregated average rating, default `0`)
- `numReviews`: Number (Total review count, default `0`)

### 2. Service Model (`Service.js`)
*Represents individual services posted by providers.*
- `title`: String (Required)
- `description`: String (Required)
- `category`: String (Required, indexed)
- `provider`: ObjectId (Ref `User`, Required)
- `price`: Number (Required, minimum `0`)
- `availability`: String (e.g., `'Mon-Sat 9AM-8PM'`)
- `location`: String (Required)
- `latitude`: Number (For GPS nearby calculations)
- `longitude`: Number (For GPS nearby calculations)
- `rating`: Number (Aggregated from customer reviews)
- `numReviews`: Number

### 3. Booking Model (`Booking.js`)
*Tracks an appointment lifecycle.*
- `customer`: ObjectId (Ref `User`, Required)
- `provider`: ObjectId (Ref `User`, Required)
- `service`: ObjectId (Ref `Service`, Required)
- `bookingDate`: Date (Required)
- `amount`: Number (Required)
- `status`: Enum `['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected']`
- `address`: String (Service location)
- `notes`: String
- `paymentStatus`: Enum `['pending', 'paid', 'failed', 'refunded']`

### 4. Payment Model (`Payment.js`)
*Records simulated payments and audit transactions.*
- `booking`: ObjectId (Ref `Booking`, Required)
- `customer`: ObjectId (Ref `User`, Required)
- `provider`: ObjectId (Ref `User`, Required)
- `amount`: Number (Required)
- `status`: Enum `['pending', 'paid', 'failed', 'refunded']`
- `paymentMethod`: String (`'card'`, `'UPI'`, `'cash'`)
- `transactionId`: String (Unique generated reference ID)

### 5. Review Model (`Review.js`)
*Collects customer ratings upon booking completion.*
- `customer`: ObjectId (Ref `User`, Required)
- `service`: ObjectId (Ref `Service`, Required)
- `booking`: ObjectId (Ref `Booking`, Required, Unique)
- `rating`: Number (1 to 5, validated)
- `comment`: String (Required)

### 6. Chat Model (`Chat.js`)
*Stores real-time conversation between customer and provider.*
- `customer`: ObjectId (Ref `User`, Required)
- `provider`: ObjectId (Ref `User`, Required)
- `booking`: ObjectId (Ref `Booking`, Optional)
- `messages`: Array of `{ sender: ObjectId, message: String, timestamp: Date }`

### 7. Dispute Model (`Dispute.js`)
*Allows customers or providers to flag issues for admin intervention.*
- `customer`: ObjectId (Ref `User`, Required)
- `provider`: ObjectId (Ref `User`, Required)
- `booking`: ObjectId (Ref `Booking`, Required)
- `reason`: String (Required)
- `description`: String (Required)
- `status`: Enum `['open', 'under_review', 'resolved', 'rejected']`
- `resolution`: String (Admin resolution summary)

---

## 6. Complete REST API Endpoint Directory

### Authentication & Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer, provider, or admin |
| `POST` | `/api/auth/login` | Public | Authenticate user & retrieve JWT token |
| `GET` | `/api/users/profile` | Protected (JWT) | Get currently authenticated user profile |
| `GET` | `/api/auth/firebase-profile` | Protected (Firebase Auth) | Verify Firebase ID token & return Firebase user details |

### Services
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/services` | Public | List services with filters (`category`, `search`, `minPrice`, `maxPrice`) |
| `GET` | `/api/services/:id` | Public | Get service details with provider profile |
| `POST` | `/api/services` | Provider | Create new service listing |
| `PUT` | `/api/services/:id` | Provider (Owner) / Admin | Update service details |
| `DELETE` | `/api/services/:id` | Provider (Owner) / Admin | Delete service listing |

### Providers
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/providers` | Public | List all providers with optional category/location filter |
| `GET` | `/api/providers/:id` | Public | Get provider profile and their active services |
| `PUT` | `/api/providers/:id` | Provider (Self) / Admin | Update provider bio, categories, contact info |

### Bookings
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Customer | Create service booking (triggers Socket.io & FCM) |
| `GET` | `/api/bookings` | Protected | Role-filtered bookings (Customer: own, Provider: own, Admin: all) |
| `GET` | `/api/bookings/:id` | Protected | Get single booking by ID (Participants or Admin) |
| `PUT` | `/api/bookings/:id/status`| Protected | Update status (`confirmed`, `in_progress`, `completed`, `cancelled`) |

### Payments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments` | Customer / Admin | Record payment for a booking |
| `GET` | `/api/payments/booking/:id` | Protected | Retrieve payment audit trail for booking |

### Reviews
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reviews` | Customer | Post review for completed booking (updates service/provider rating) |
| `GET` | `/api/reviews/service/:id` | Public | Retrieve all reviews for a service |

### Chats
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/chats` | Protected | Send message or start conversation (emits `chat:message`) |
| `GET` | `/api/chats/:id` | Protected | Get conversation history by chat ID |
| `GET` | `/api/chats` | Protected | Get all active conversations for current user |

### Geolocation
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/geolocation/nearby` | Public | Haversine distance search (`?lat=19.11&lng=72.86&radius=10`) |
| `GET` | `/api/geolocation/search` | Public | Text query search (`?location=Mumbai&service=Electrical`) |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/providers` | Admin | List all providers with service and booking metrics |
| `PUT` | `/api/admin/verify/:id` | Admin | Verify / unverify provider account (`{ isVerified: true }`) |
| `GET` | `/api/admin/disputes` | Admin | List all platform disputes |
| `PUT` | `/api/admin/disputes/:id` | Admin | Resolve or update dispute status (`resolved`, `rejected`) |
| `POST` | `/api/admin/disputes` | Protected | Customer or Provider files dispute for a booking |

### Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/notifications/send`| Protected | Push FCM / mock notification to device token |

---

## 7. Architecture & System Workflows

### A. Authentication & Authorization Flow

LocalServe features a **Dual-Authentication Architecture**:

#### 1. Custom JWT Authentication (Native Platform Users)
1. **Registration / Login**: Client sends credentials to `POST /api/auth/register` or `POST /api/auth/login`. Passwords are encrypted using `bcrypt.hash(password, 10)`.
2. **Token Generation**: On valid login, a signed JWT is returned containing `{ id, role }` with a 7-day expiration (`jwt.sign`).
3. **Authentication Middleware (`protect`)**: Extracts the `Bearer <token>` from the HTTP `Authorization` header, verifies the secret via `jwt.verify`, and attaches `req.user = { id, role, _id }`.
4. **Authorization Middleware (`authorize('provider', 'admin')`)**: Evaluates `req.user.role`. If the user's role is not included in the allowed list, the request is immediately terminated with `HTTP 403 Forbidden`.

#### 2. Firebase Authentication (`verifyFirebaseToken`)
1. **What it does**: Allows external/mobile client applications to authenticate users via Firebase (e.g., Google Sign-In, Phone OTP, Email/Password) and verify their credentials on the backend.
2. **Token Verification**: Handled by [`middleware/firebaseAuthMiddleware.js`](file:///Users/sumitshingole/LocalServe(Backend_Project)/middleware/firebaseAuthMiddleware.js). It extracts `Bearer <Firebase ID Token>` and verifies it cryptographically with the Google Firebase Admin SDK via:
   ```javascript
   const decodedToken = await admin.auth().verifyIdToken(idToken);
   req.firebaseUser = decodedToken;
   ```
3. **Demonstration Endpoint**: `GET /api/auth/firebase-profile` returns `{ uid, email, email_verified, name }` upon successful token verification.
4. **How to Obtain a Firebase ID Token for Testing**:
   - In a web or mobile frontend connected to Firebase:
     ```javascript
     const user = firebase.auth().currentUser;
     const idToken = await user.getIdToken();
     ```
   - Or via Firebase REST API (`identitytoolkit.googleapis.com`):
     ```bash
     curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=FIREBASE_WEB_API_KEY" \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com","password":"password123","returnSecureToken":true}'
     ```
     The returned `idToken` can then be passed to:
     ```bash
     curl -H "Authorization: Bearer <idToken>" http://localhost:5001/api/auth/firebase-profile
     ```

#### 3. Comparison: JWT vs Firebase Authentication
| Feature | Custom JWT Authentication | Firebase Authentication |
|---|---|---|
| **Token Issuer** | LocalServe Node.js server (`generateToken.js`) | Google Firebase Auth Servers |
| **Token Secret / Key** | Symmetric secret (`JWT_SECRET`) in `.env` | Asymmetric RSA Public/Private Keypair managed by Google |
| **User Store** | MongoDB Atlas (`users` collection) | Firebase Authentication Cloud Directory |
| **Verification Method** | `jwt.verify(token, JWT_SECRET)` | `admin.auth().verifyIdToken(token)` via Firebase Admin SDK |
| **Middleware** | `protect` in `middleware/authMiddleware.js` | `verifyFirebaseToken` in `middleware/firebaseAuthMiddleware.js` |
| **Protected Endpoints**| Core business logic (`/api/bookings`, `/api/services`, etc.) | Identity verification (`/api/auth/firebase-profile`) |

### B. Booking Lifecycle & State Transitions
```
                [Customer creates booking]
                           │
                           ▼
                       (pending)
                      /         \
   [Provider confirms]           [Provider rejects / Customer cancels]
          │                                  │
          ▼                                  ▼
     (confirmed)                        (rejected / cancelled)
          │
  [Provider starts]
          │
          ▼
    (in_progress)
          │
 [Provider completes]
          │
          ▼
     (completed) ──▶ [Customer posts Payment] ──▶ [Customer writes Review]
```
- **Validation**: Customer can only cancel prior to completion; Provider transitions through `pending -> confirmed -> in_progress -> completed`.
- Every status update automatically emits a real-time event to Socket.io and dispatches a notification!

### C. Geolocation (Haversine Formula)
Instead of forcing strict GeoJSON schema migrations that risk Atlas index timeouts during college vivas, LocalServe implements the standard **Haversine Formula** over `latitude` and `longitude` fields:
$$\Delta d = 2 R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
- Where $R = 6371\text{ km}$ (Earth's radius).
- The API accepts `lat`, `lng`, and `radius` (in km), calculates distances, filters matching services, attaches `distanceKm` to each record, and sorts by closest proximity.

### D. Socket.io Real-Time Updates
- Integrated directly into the Express HTTP server in `server.js`.
- Clients can join targeted rooms:
  - `user_<userId>` for personal notifications.
  - `booking_<bookingId>` for live tracking of a specific job.
- Events emitted:
  - `booking:created`: Broadcast when a customer books a provider.
  - `booking:status`: Broadcast whenever status changes (`confirmed`, `in_progress`, etc.).
  - `chat:message`: Broadcast when a customer or provider sends a text message.
- *Zero-impact fallback*: The REST API functions seamlessly even when no socket clients are connected.

### E. Firebase Cloud Messaging (FCM) & Graceful Fallback
- Configured in `services/firebaseService.js`.
- Inspects environment variables: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
- If keys are present: Initializes `admin.initializeApp` and delivers live push notifications via `admin.messaging().send()`.
- If keys are omitted: Seamlessly falls back to **Mock Notification Mode**, logging the dispatched message to the server console and returning HTTP 200 without crashing the server!

---

## 8. Environment Setup & Configuration

Create a `.env` file in the root directory (refer to `.env.example`):

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/localserve?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_localserve_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000

# Optional: Firebase Cloud Messaging (leave blank for Mock Mode)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## 9. How to Run the Server

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server (with nodemon)**:
   ```bash
   npm run dev
   ```

3. **Start the Production Server**:
   ```bash
   npm start
   ```

Server will run on: `http://localhost:5001`  
Test base endpoint: `curl http://localhost:5001/` -> `LocalServe API is running`

---

## 10. Step-by-Step Postman Demonstration Guide

Import the included files located in the `postman/` directory:
1. `postman/LocalServe.postman_collection.json`
2. `postman/LocalServe.postman_environment.json`

Select the **LocalServe Environment (Local)** environment in Postman. The pre-configured test scripts will automatically capture tokens and IDs across requests!

### Exact Demonstration Order:
1. **Register Customer**: `POST /api/auth/register` (Role: `customer`) -> Saves `customerToken` and `customerId`.
2. **Register Provider**: `POST /api/auth/register` (Role: `provider`) -> Saves `providerToken` and `providerId`.
3. **Register Admin**: `POST /api/auth/register` (Role: `admin`) -> Saves `adminToken`.
4. **Get Profile**: `GET /api/users/profile` -> Tests JWT token extraction.
5. **Create Service**: `POST /api/services` (Using `providerToken`) -> Creates service, saves `serviceId`.
6. **Get Services**: `GET /api/services?category=Electrical` -> Verifies public service catalog.
7. **Get Service by ID**: `GET /api/services/{{serviceId}}` -> Shows populated provider info.
8. **Update Provider Profile**: `PUT /api/providers/{{providerId}}` -> Adds bio & categories.
9. **Nearby Services**: `GET /api/geolocation/nearby?lat=19.1136&lng=72.8697&radius=10` -> Demonstrates Haversine distance calculations.
10. **Create Booking**: `POST /api/bookings` (Using `customerToken`) -> Saves `bookingId`, triggers Socket.io & FCM mock.
11. **Provider Gets Bookings**: `GET /api/bookings` (Using `providerToken`) -> Displays only provider's bookings.
12. **Update Booking to Confirmed**: `PUT /api/bookings/{{bookingId}}/status` (`status: "confirmed"`).
13. **Update Booking to Completed**: `PUT /api/bookings/{{bookingId}}/status` (`status: "completed"`).
14. **Customer Payment**: `POST /api/payments` -> Records payment, updates booking `paymentStatus: "paid"`.
15. **Customer Review**: `POST /api/reviews` (Rating: `5`) -> Validates rating, automatically updates average service score.
16. **Send Chat Message**: `POST /api/chats` -> Sends message from customer to provider, emits Socket.io event.
17. **Admin Verify Provider**: `PUT /api/admin/verify/{{providerId}}` (`isVerified: true`).
18. **Raise Dispute**: `POST /api/admin/disputes` -> Customer creates dispute on booking.
19. **Admin Resolve Dispute**: `PUT /api/admin/disputes/{{disputeId}}` (`status: "resolved"`).
20. **Notification Test**: `POST /api/notifications/send` -> Demonstrates zero-crash FCM fallback.

---

## 11. Common Errors and Solutions

| Problem | Cause | Solution |
|---|---|---|
| `EADDRINUSE: port 5001 already in use` | Another process is holding port 5001 | Run `lsof -i :5001` and `kill -9 <PID>`, or change `PORT=5002` in `.env`. (Note: macOS AirPlay Receiver uses port 5000 by default, so 5001 is recommended). |
| `401 Not authorized, no token provided` | Missing Bearer token header | Ensure header includes `Authorization: Bearer <token>`. |
| `403 Forbidden: role 'customer' is not authorized` | Wrong role accessing restricted endpoint | Check that the authenticated token corresponds to the expected role (e.g., only `provider` can create services). |
| `MongoDB Connection Error` | Invalid MongoDB Atlas connection string or IP not whitelisted | Check `MONGO_URI` in `.env` and ensure your current IP is added to the MongoDB Atlas Network Access whitelist (`0.0.0.0/0` for development). |
| `Firebase Credentials Not Found` | No FCM keys configured | Normal behavior! LocalServe switches to Mock Notification mode automatically and does not crash. |

---

## 12. Viva Questions and Answers

### Q1: What is the architectural style of LocalServe?
**Answer:** LocalServe is built using a **RESTful micro-service oriented modular architecture** on top of Node.js and Express. It follows the **Model-View-Controller (MVC)** design pattern, keeping route definitions, controller business logic, database models, and middleware cleanly separated.

### Q2: What is the difference between Authentication and Authorization in LocalServe?
**Answer:**
- **Authentication (`protect` middleware)**: Answers *"Who are you?"* by validating the incoming JSON Web Token (JWT) signature and extracting the user ID.
- **Authorization (`authorize` middleware)**: Answers *"What are you allowed to do?"* by checking `req.user.role` against permissible roles (`customer`, `provider`, `admin`) and returning `HTTP 403 Forbidden` if unauthorized.

### Q3: Why did you use JWT instead of session-based cookies?
**Answer:** JWTs are **stateless**. The server does not need to store session states in a database or memory store like Redis. The cryptographic signature guarantees authenticity, making the backend lightweight, highly scalable, and friendly to mobile or decoupled frontend clients.

### Q4: How is password security managed?
**Answer:** Passwords are never stored in plaintext. We use the **bcrypt** hashing algorithm with a salt round factor of 10. During authentication, `bcrypt.compare()` compares the plain password with the hashed digest using constant-time comparison to prevent timing attacks.

### Q5: How is geolocation implemented without GeoJSON index complexity?
**Answer:** We implemented the **Haversine Formula** in our `geolocationController.js`. The database stores decimal `latitude` and `longitude` fields. The controller takes the user's current coordinates, calculates the spherical distance in kilometers using the trigonometric formula ($R = 6371\text{ km}$), and filters results strictly within the requested radius.

### Q6: How does Socket.io integrate with Express?
**Answer:** Socket.io is mounted directly onto the underlying Node.js `http.Server` instance wrapping Express (`http.createServer(app)`). When state updates occur (e.g. `booking:created`, `booking:status`, `chat:message`), our controllers invoke a shared helper `emitSocketEvent()`, broadcasting the event to specific client rooms or globally.

### Q7: What happens if Firebase credentials are not provided?
**Answer:** The `firebaseService.js` incorporates a robust **defensive fallback**. It tries to initialize Firebase Admin SDK. If keys are missing, it flags `isFirebaseInitialized = false` and enters a Mock Notification mode that logs payloads safely to the terminal. This guarantees the backend will never crash during an offline examiner demonstration.

### Q8: How is the average service rating calculated?
**Answer:** When a customer submits a review (`POST /api/reviews`), the controller validates that the customer completed the booking and hasn't reviewed it before. Once created, Mongoose aggregates all reviews matching that service, computes `sum / count`, and atomically updates both `rating` and `numReviews` on the `Service` model and the `User` (provider) profile.

---

### Developed for B.Tech CSE Viva Demonstration
*All endpoints tested and verified against live MongoDB Atlas instance.*
