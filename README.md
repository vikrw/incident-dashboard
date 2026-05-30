# Incident Dashboard UI

This is a modern, high-performance Incident Dashboard built with **Angular 21**, **@Ngrx/signal** and **Tailwind CSS**. It is designed to manage system anomalies at scale with premium UX, robust state management, and optimized rendering behaviors.

## Key Features

- **State Management (NgRx SignalStore)**: Powered by `@ngrx/signals` to establish a reactive, single-source-of-truth state container. It seamlessly connects Angular's reactive Signals (`computed`, `effect`, etc.) with asynchronous operations.
- **Infinite Virtual Scrolling**: Employs `<cdk-virtual-scroll-viewport>` from the Angular CDK to render only the visible rows inside the viewport (~10 rows). This keeps DOM footprint at `O(1)` complexity, ensuring smooth scrolling regardless of dataset size (e.g. 50k+ records).
- **Server-Side Pagination & Filter Delegation**: Offloads sorting, pagination, and text searching to the backend (using `json-server` v1 parameter structures).
  - Search queries are mapped using json-server's new `_where` JSON-encoded OR filters.
  - Offloading heavy filtering from the main JS thread prevents UI lag and cuts down network payload size.
- **Safe, Isolated Optimistic Updates**: 
  - Status updates are applied instantly on the UI for a snappy user experience.
  - If the server request fails, the store performs a granular, isolated rollback of **only** the target incident's status. It does not replace the entire list array, protecting the active filtered search results from state corruption if filters changed during the pending API call.
- **Type-Safe Dynamic Filters**:
  - Filter option choices are defined in the component class and dynamically rendered using Angular control flow (`@for`).
  - Employs strict TypeScript generics `onFilterChange<K extends keyof IncidentFilter>(key: K, value: IncidentFilter[K])` to validate parameter constraints at compile-time.
- **RxJS Search Debouncing**: Integrates Angular/RxJS interop (`toObservable` and `toSignal`) to debounce search inputs by `300ms`, preventing excessive network calls.
- **Lazy Loaded Details Panel**: Uses Angular's `@defer` block to lazy-load the Incident Details component only when an incident is actively selected, saving bundle size.
- **State-Synchronized Collapsing**: The details panel automatically collapses and returns the list view to full width if the selected incident is filtered out of the current view.
- **Automated Dev Server (Concurrently)**: Configured with `concurrently` to spin up both the mock database API and the Angular compiler simultaneously with a single command.
- **Strong API Type Safety**: Enforces complete end-to-end type safety using a generic `PaginatedResponse<T>` interface, removing all unsafe `any` usages from HTTP requests.
- **Clean Subscription Hygiene**: Employs NgRx `rxMethod` pipelines for infinite scroll pagination, eliminating raw, unmanaged `.subscribe()` calls that cause memory leaks.
- **Template Performance Optimization**: Implements pure Angular pipes (`SeverityClassPipe` and `StatusDotClassPipe`) to resolve classes, preventing expensive template method re-evaluations on every change detection cycle.
- **A11y Accessibility Enhancements**: Applied `aria-hidden` and `focusable` controls on purely decorative SVGs to ensure standard-compliant assistive screen-reader compatibility.

---

## Project Structure

The project structure is organized for scale and maintainability:
```text
src/app/
├── components/          # Presentational components (dumb)
│   ├── filters/         # Search & filter drop-downs
│   ├── incident-details # Incident review & status management
│   ├── incident-list    # Virtual scroll list viewport
│   └── toast-container  # System alerts
├── dashboard/           # Container component (smart)
├── models/              # Type-safe domain models & interfaces
│   ├── incident.model.ts
│   ├── incident-filter.model.ts
│   ├── incident-state.model.ts
│   ├── paginated-response.model.ts
│   └── toast.model.ts
├── pipes/               # Custom pure Angular pipes (performance)
│   ├── severity-class.pipe.ts
│   └── status-dot-class.pipe.ts
├── services/            # API & notification layer services
├── store/               # State store utilizing NgRx SignalStore
└── app.ts               # Main shell component
```

---

## Testing Strategy

- **Test Runner**: Jest is used for fast, automated unit testing.
- **Store Coverage**: State transitions, filtering, and optimistic rollback paths are fully tested.
- **Race Condition Testing**: Employs RxJS `Subject` mocks in `incident.store.spec.ts` to test delayed asynchronous server failures, verifying that concurrent search updates are not corrupted when a pending background request fails.

---

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
This command spins up the mock json-server on port 3000 and the Angular dev server on port 4200 concurrently:
```bash
npm start
```

### 3. Run Unit Tests
Executes all Jest unit tests:
```bash
npm run test
```
