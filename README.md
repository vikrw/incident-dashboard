# Incident Dashboard UI

This is a modern, high-performance Incident Dashboard built with **Angular 21.2.14**. 

## Features
- **Signal-Driven Architecture**: Fully embraces Angular's new reactive primitives (`signal`, `computed`, `effect`, `input`, `output`) to eliminate the need for Zone.js checking and improve rendering speed.
- **Resource API**: Utilizes the bleeding-edge Angular `resource()` API to handle asynchronous data fetching, loading states, and error handling seamlessly.
- **Smart/Dumb Component Pattern**: 
  - `DashboardComponent` (Smart): Injects the state and orchestrates data down.
  - `FiltersComponent`, `IncidentListComponent`, `IncidentDetailsComponent` (Dumb): Purely presentational with strictly typed Signal inputs.
- **Optimistic UI Updates**: When updating an incident's status, the UI immediately reflects the change to ensure a snappy user experience, while the mock API confirms the action in the background.
- **Lazy Loaded Details View**: Uses Angular's `@defer` block to lazy-load the Incident Details panel only when an incident is selected, significantly reducing the initial bundle size.
- **Tailwind CSS**: Uses utility classes for a highly aesthetic, glassmorphic, and responsive layout.

## Testing Strategy
- The application includes configurations for **Jest** as the primary test runner.
- Unit testing focuses heavily on the `IncidentStore` (the state management layer) to ensure filtering logic and state transitions are bulletproof.
- In a real-world scenario, I would evolve this testing strategy by adding **Cypress** or **Playwright** for End-to-End (E2E) testing to verify critical user flows like filtering and updating incident statuses.

## State Management Approach
For this assessment, the state is managed via an `@Injectable` Angular service acting as a Store.
Initially, the `@ngrx/signals` SignalStore was considered, but given the strict requirement to showcase the native Angular `resource()` API, writing a native Angular state service provided the cleanest and most robust integration. Native Signals combined with `resource()` essentially form a powerful built-in state machine without relying on external boilerplate.

## What I would improve next in a real codebase
1. **Real API Integration**: Swap the `IncidentService` mock data logic with Angular's `HttpClient` inside the `resource()` loaders.
2. **WebSockets for Real-time Data**: Incidents are highly dynamic. Implementing real-time pushes (e.g., via SignalR or standard WebSockets) would be crucial so the dashboard stays up to date without manual reloading.
3. **Advanced Filtering / URL Sync**: Sync the active filters to the URL query parameters so users can share links to specific dashboard views.
4. **Enhanced Accessibility**: Add robust keyboard navigation between list items and detail views, ensuring screen-reader announcements dynamically update when loading states change.

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run start
   ```

3. Run Unit Tests:
   ```bash
   npm run test
   ```
