# Lightning Kite React Starter

The purpose of this project is to be a starting point for new React apps that use Lightning Server as the backend. It is already set up with many packages and components that will be used in almost all projects including:

- Module bundling and local development with Vite
- Authentication
- Ability to switch which backend deployment is used from the login screen
- Mock API for local development without running the backend
- MUI UI component library including material icons
- React Router with several example routes for reference
- Formik for form state management with Yup for validation
- Eslint, Prettier, and automatic import reordering

Documentation for included packages:

- [Vite](https://vitejs.dev/)
- [MUI Lightning Components](https://www.npmjs.com/package/@lightningkite/mui-lightning-components)
- [React MUI basic components](https://mui.com/material-ui/getting-started/overview/)
- React MUI-X [date pickers](https://mui.com/x/react-date-pickers/getting-started/) and [data grid](https://mui.com/x/react-data-grid/)
- [React Router](https://reactrouter.com/en/main/start/overview)
- [Formik](https://formik.org/docs/overview)
- [Yup](https://www.npmjs.com/package/yup)
- [Faker](https://fakerjs.dev/api/)

## Using the Starter Project

This starter project can be run locally with node 18 by running `npm install` then `npm start`. To use it as a starter for a new project, fork this repo, then follow the steps below.

To avoid conflicting localStorage keys with other projects you're developing locally, you can change the prefix of the keys in `src/utils/constants.ts` to something unique to your project.

## Node

This project is compatible with node version 18.

NVM is recommended to easily manage installed node versions. Install nvm using this guide: [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm).

```bash
nvm install 18
nvm use 18
```

## Environment Variables

_Read more about environment variables and deployment modes in Vite:_ [https://vitejs.dev/guide/env-and-mode.html](https://vitejs.dev/guide/env-and-mode.html)

Vite uses dotenv to load environment variables. Values in `.env.production` or `.env.staging` will override those in `.env` when doing a production build.

**VITE_BACKEND_HTTP_URL** is the default backend URL for the deployment. The actual backend URL being used can still be customized using the developer options on the login screen

To access an environment variable at runtime, use `import.meta.env.VITE_MY_VARIABLE`. To determine if the application is running in development or production mode, use `import.meta.env.DEV` or `import.meta.env.PROD` respectively (both are boolean values).

If you add additional environment variables, you can specify their types in `/src/env.d.ts`. Prefix all env variables with `VITE_` to include them in the client bundle.

## Lightning Server SDK & Mock Data

Generate an SDK your project's lightning server backend, then use it to replace the file `src/api/sdk.ts`.

There are 2 relevant files for using mock data located in the `src/api` directory: `mockDatastore.ts` and `mockApi.ts`.

The MockDatastore interface should contain all models provided by your app's backend through rest endpoints. For each of your apps models, create a function to generate mock data and put it in a file in the `src/api/mocks` directory. Use these function to generate a MockDatastore object in the `generateMockDatastore` function.

In `mockApi.ts`, the `MockApi` class should implement the `Api` interface from your SDK to provide mock data without making any calls to a server. The `mockRestEndpointFunctions` function from lightning-server-simplified will mock all of the standard rest endpoints for you.

```typescript
// src/api/mockApi.ts

export class MockApi implements Api {
	...

	readonly user = {
		...mockRestEndpointFunctions<User>(this.mockDatastore.users, "user"),
		// Add any custom endpoints here
	}
}
```

To use the mock API, select the Mock server from the login screen.

## Project Organization

All source code should be placed in the `src` directory. `App.tsx` contains the switch for rendering either the authenticated routes or unauthenticated routes depending on the auth state, and also provides react context to the app.

Most projects will benefit from using the following directory organization inside `src`:

### /layouts

Layouts contain page structure that is common across many pages such as a header, footer, or navigation bar. Most apps will only have 2 layouts, one for authenticated pages and one for unauthenticated pages.

### /routers

Router files provide routing to different pages using react router. Usually there will be one router for each layout.

### /pages

Each file or directory in pages represents a "page" or "view" in the application. These pages are conditionally rendered by the routers. If all unique code for a page can reasonably be included in one file, then place a .tsx file directly in the `pages` directory. If the page is more complex and has several components (see for example the Login page), create a directory for that page with an `index.ts` file inside.

### /components

Components in this directory are not specific to any one page, but can be reused across many different pages or layouts.

### /styles

We have learned by sad experience that it is the nature and disposition of almost all developers, as soon as they get a little authority, as they suppose, they will immediately begin to write a bunch of convoluted, unmaintainable CSS.

Don't write CSS. Use MUI's styling system instead (see comments in `theme.ts`). If you need to add inline styles to a MUI component, use the `sx` prop. If you need to add styles to a non-MUI component, use the `styles` prop.

If you really really need to write CSS (for example to override styles from a third party component), there's a `index.css` file in this directory you can use.

### /api

See the "Lightning Server SDK & Mock Data" section above. You shouldn't need to add any additional files to this directory besides what is mentioned in that section.

### /utils

This is a catch-all directory for utility functions, models, hooks, helpers, or providers.

## Deployment

Before deploying, remember to update the following app information:

- Upload a new favicon
- Update meta tags in `/index.html`
- Set correct environment variables in `.env.production` (See the "Environment Variables" section above)

To create a production build with Vite, run `npm run build:stage` or `npm run build:prod`. To serve the build locally, run `npm run serve`.

This project has been set up with `rollup-plugin-analyzer` to show you the final bundle sizes. Use code splitting in React in appropriate places to reduce the bundle size if needed. See an example of this in `AuthRoutes.tsx`.
