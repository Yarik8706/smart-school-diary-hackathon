## Functions

- `apiClient.request<T>(endpoint, options)` in `lib/api-client.ts` executes HTTP requests against `NEXT_PUBLIC_API_URL`, normalizes request body/headers, and throws typed API errors.
- `apiClient.get<T>()` and `apiClient.post<T>()` in `lib/api-client.ts` provide typed convenience wrappers.
- `useAppStore` in `store/use-app-store.ts` stores a basic readiness flag for initial Zustand wiring.
- `ProjectHealth` in `components/common/project-health.tsx` renders bootstrap status and demonstrates Zustand + GSAP interaction.

## Types

- `ApiRequestOptions` describes typed request options with JSON/FormData body support.
- `ApiErrorPayload` defines normalized API error shape used by the API client.
- `AppState` describes the Zustand store contract (`isReady`, `setIsReady`).

## Data Flow

1. `app/page.tsx` renders `ProjectHealth`.
2. `ProjectHealth` reads and updates state via `useAppStore`.
3. Components can call `apiClient` helpers for backend communication using environment-configured base URL.
4. Tailwind + shadcn tokens from `app/globals.css` style all UI.

## Notes

- Frontend scaffold is based on Next.js App Router with TypeScript strict mode.
- `components/`, `store/`, `lib/`, and `types/` folders are initialized for scalable structure.
- Prettier is configured with Tailwind plugin to keep utility classes consistently ordered.
- `.env.local.example` documents required environment variable `NEXT_PUBLIC_API_URL`.
- App icon uses `app/icon.svg` to avoid binary assets in the repository baseline.
