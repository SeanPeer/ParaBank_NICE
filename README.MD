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


## Infrastructure Considerations

### Project Architecture
I would organize the project by responsibility, not just by test type.  
Tests should stay simple and readable, while reusable logic moves into separate layers.

- **UI layer**: page objects, reusable components, and shared page behavior
- **API layer**: API client, service classes, typed models, and response helpers
- **Flow layer**: business journeys like login or registration, especially when retries or multiple outcomes are involved
- **Test layer**: focused on business scenarios, not technical implementation details

This keeps the framework clean, scalable, and easy to maintain.

### Configuration Management
Configuration should be centralized and environment-based.  
Things like base URLs, credentials, timeouts, and retry settings should come from environment variables, not hardcoded values.

I would use a config utility to validate and expose these settings.  
For multiple environments, I would support profiles such as local, dev, and staging.  
Sensitive data should come from CI secrets or secure runtime injection.

This makes switching environments safer and easier.

### Reporting & Debugging
For reporting, I would use Playwright’s HTML report as the main report.  
I would also keep traces, screenshots, and videos on failures to help debug problems quickly.

For API debugging, I would use structured logs with useful details like:
- endpoint
- status code
- retry attempts
- short failure summary

For UI debugging, I would rely on stable selectors, clear assertions, and good wait strategies.

The goal is to leave enough evidence after a failed run so the issue can be understood without rerunning the test.

### CI Implementation
In CI, I would run the framework in clear stages:

1. Install dependencies and browsers
2. Run linting and type-checking
3. Run smoke or critical tests first
4. Run broader regression tests after that

I would publish reports and failure artifacts directly in CI.  
Retries should be limited and only used for temporary environment issues, not to hide real bugs.

I would also separate UI and API suites when needed, since they often behave differently in CI.

### Dockerization
I would use Docker to create a consistent execution environment.  
The image would include Node.js, Playwright, browser dependencies, and any required tools.

This helps avoid machine-specific issues and makes local setup and CI more reliable.  
The container should accept environment variables at runtime so the same image can run in different environments without rebuilding.

The main benefit of Docker is consistency, portability, and easier onboarding.