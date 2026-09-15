# Meatshop frontend

Vue 3 + TypeScript + Vite frontend for the `meatshop` backend.

The project reuses:

- `@katren/vue-business-app`
- `@katren/vue-collection-lib`
- PrimeVue
- Pinia
- Vue Router
- Vue I18n
- Valibot
- Tailwind CSS 4
- WebSocket manager from `vue-collection-lib`

## Install in the workspace

Expected workspace layout:

```text
dronm-workspace/
	apps/
		meatshop-admin/
	packages/
		vue-business-app/
		vue-collection-lib/
```

Copy this directory to `apps/meatshop-admin`, then run:

```bash
cd dronm-workspace/apps/meatshop-admin
npm install
npm run type-check
npm run dev
```

The development backend is configured as `http://localhost:59000` and WebSocket as `ws://localhost:59000/ws`.

## Initial frontend functionality

- login/logout;
- shared vertical main menu;
- shared program-about dialog;
- shared main-menu constructor;
- Users CRUD;
- role schema generated from backend `RoleID` (`admin`);
- backend session cookies (`credentials: include`);
- collection WebSocket support.

## Backend contract observations

The supplied backend has an `ApplicationRoute` model/service, but no HTTP routes for it in `internal/httpapi/BuildRoutes()`. Therefore the frontend intentionally does not expose the shared Application Routes administration screen yet.

The supplied migration also only inserts a subset of route permissions. The HTTP routes require permissions such as `mainMenu.for_user`, `mainMenu.list`, `mainMenu.create`, `progAbout.info`, and `user.create`, but these are not present in `000001_init.up.sql`. Add those permissions (and grant them to `admin`) before expecting all initial frontend functions to work.
