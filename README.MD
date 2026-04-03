# ParaBank Playwright Automation Framework

Production-ready Playwright automation framework for ParaBank, built to validate core banking workflows across UI and API layers with reusable architecture, typed abstractions, resilient flows, and clear separation of concerns.

## Project Goal

This project was built as a framework-oriented solution for the ParaBank home assignment, with focus on:

- maintainability
- scalability
- reusability
- engineering discipline
- practical handling of unstable public test environments

The solution covers UI, API, and hybrid end-to-end flows rather than only isolated test scripts.

---

## Application Under Test

- UI: `https://parabank.parasoft.com/parabank`
- Swagger / API docs: `https://parabank.parasoft.com/parabank/api-docs/index.html`

---

## Covered Scenarios

### UI happy path
Validates the main customer-facing onboarding and authentication journey:

- register a new user in UI
- handle duplicate username collisions in a resilient way
- logout after registration
- login with the newly created user
- handle transient internal login errors with retry
- verify authenticated landing page

### API happy path
Validates core backend banking operations using a stable API-compatible user:

- login via API
- get customer ID
- get customer accounts
- create new CHECKING account
- validate created account details

### Hybrid happy path
Validates the cross-layer business flow required by the assignment:

- login via API
- get existing account via API
- create new CHECKING account using curl
- login via UI
- verify new account appears in UI
- transfer money between accounts in UI
- validate updated balances via API
- logout

### Negative scenarios
The suite includes at least 3 negative tests:

1. login with invalid credentials
2. register with an existing username
3. get account with invalid account ID

---

## Setup

### Prerequisites

- Node.js 18+
- npm
- Playwright
- `curl` available in system PATH

> Note: `curl` is required because the assignment explicitly asked to create the CHECKING account using a curl command. The framework wraps curl inside a reusable infrastructure layer rather than executing raw shell commands directly in test files.

### Install dependencies

```bash
npm install
npx playwright install 
```

## Environment Configuration
- Create a .env file based on .env.example.
- Notes
  - `BASE_URL` is used for UI tests
  - `API_BASE_URL` is used for API requests
  - `API_USERNAME` and `API_PASSWORD` are used for stable API and hybrid scenarios

## Run Tests
###Run all tests
```bash
 npm test
 ```

### Run headed
```bash
npm run test:headed
```

### Run UI mode
```bash
npm run test:ui
```

### Run specific test file
```bash
npx playwright test src/tests/e2e/ui/ui-banking-happy-path.spec.ts
```

### Run only negative tests
```bash
npx playwright test src/tests/negative
```

### Open Playwright report
```bash
npm run report
```

# Project Structure

```
src/
├─ api/
│  ├─ client/
│  │  ├─ api.client.ts
│  │  └─ curl.client.ts
│  ├─ models/
│  │  ├─ account.types.ts
│  │  ├─ customer.types.ts
│  │  └─ transfer.types.ts
│  ├─ parsers/
│  │  └─ xml.parser.ts
│  └─ services/
│     ├─ auth.api.ts
│     ├─ customers.api.ts
│     └─ accounts.api.ts
│
├─ fixtures/
│  └─ app.fixture.ts
│
├─ flows/
│  ├─ registration.flow.ts
│  └─ login.flow.ts
│
├─ ui/
│  └─ pages/
│     ├─ base.page.ts
│     ├─ home.page.ts
│     ├─ register.page.ts
│     ├─ accounts-overview.page.ts
│     └─ transfer-funds.page.ts
│
├─ utils/
│  ├─ env.ts
│  └─ user.factory.ts
│
└─ tests/
   ├─ e2e/
   │  ├─ ui/
   │  ├─ backend/
   │  └─ hybrid/
   └─ negative/
      ├─ ui/
      └─ api/
```


## Tradeoffs

### 1. Chromium only
The project currently runs on Chromium only.

**Why**
- the assignment did not require cross-browser validation
- focusing on one browser allowed deeper framework quality within the time scope

**Tradeoff**
- faster and simpler implementation
- cross-browser execution can be added later easily through Playwright projects

### 2. Regex-based XML parsing instead of full XML library
The XML responses in the public ParaBank environment are simple and predictable, so a lightweight parser utility was used rather than adding a dedicated XML parsing package.

**Tradeoff**
- simpler dependency footprint
- good enough for this assignment
- a full XML library would be preferred for more complex enterprise XML contracts

### 3. Split happy paths instead of one giant E2E
Because the public environment showed inconsistent behavior between UI-created users and API authentication, the happy path was split into focused UI, API, and hybrid flows.

**Tradeoff**
- more stable and more honest
- slightly less “single-scenario” appearance
- better engineering accuracy for a real unstable public environment

### 4. Curl only where explicitly required
Only the account creation step uses curl, because that is what the assignment asked for.

**Tradeoff**
- satisfies requirement directly
- avoids overusing shell execution
- preserves the rest of the API framework as typed, reusable code

## Assumptions

- `john/demo` or another stable configured API user remains valid for API and hybrid flows
- `curl` is available in the execution environment
- the ParaBank public environment remains reachable and relatively stable
- newly created accounts created via API/curl appear in UI for the same stable user
- transfer operations reflect in account balances through the exposed API endpoints
- duplicate username validation message remains: `This username already exists.`
- registration success message remains: `Your account was created successfully. You are now logged in.`
- transient internal login error remains: `An internal error has occurred and has been logged.