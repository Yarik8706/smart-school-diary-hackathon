## Functions

- `RootLayout` in `app/layout.tsx` applies Inter font, metadata, and wraps all routes into `AppShell`.
- `AppShell` in `components/layout/app-shell.tsx` composes `Sidebar`, `Header`, and `BottomNav`, maps route titles, and runs GSAP entry animations on navigation.
- `Sidebar` in `components/layout/sidebar.tsx` renders desktop navigation with active-state highlighting and collapse/expand behavior.
- `BottomNav` in `components/layout/bottom-nav.tsx` renders fixed mobile navigation with icon + label tabs.
- `Header` in `components/layout/header.tsx` displays the current page title and action slot with `NotificationBell`.
- `NotificationBell` in `components/layout/notification-bell.tsx` polls `/api/v1/reminders/pending` every 60 seconds and renders a dropdown with pending reminders.

## Types

- `NavigationItem` in `components/layout/navigation-config.ts` defines typed navigation records (route, label, icon component).
- `ReminderItem` and `PendingRemindersResponse` in `components/layout/notification-bell.tsx` define reminder payload structures for polling UI.
- `pageTitles` in `components/layout/navigation-config.ts` centralizes route-to-title mapping used by the header.

## Data Flow

1. Every route is wrapped by `RootLayout` and rendered inside `AppShell`.
2. `AppShell` reads pathname from App Router and passes mapped title to `Header`.
3. `Sidebar` and `BottomNav` reuse `navigationItems` config and compute active items by current pathname.
4. `NotificationBell` fetches pending reminders via `apiClient.get` and refreshes data on a 60-second interval.
5. Route pages (`/`, `/schedule`, `/homework`, `/reminders`, `/analytics`, `/materials`) render section-level content inside the shared shell container.

## Notes

- `next.config.ts` enables `experimental.turbopackUseSystemTlsCerts` to avoid Google Fonts TLS issues in this environment.
- `next.config.ts` also sets `allowedDevOrigins` for `127.0.0.1` used by browser-based integration checks.
- Primary and accent color tokens in `app/globals.css` are shifted to brighter values to match the school-themed UI direction.
- `@tabler/icons-react` is used for all navigation/action icons to align with project icon rules.
