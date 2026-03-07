# Castglo

## Project info

**Castglo** - The Future of Casting & Talent Discovery

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd castglo/client

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Vercel Deployment

This project is optimized for deployment on Vercel.

1.  **Configure SPA Routing**: A `vercel.json` file is included to handle client-side routing.
2.  **Environment Variables**: Add the following environment variables in the Vercel project settings:
    - `VITE_API_BASE_URL`: The URL of your backend API (e.g., `https://castglo-qupm.onrender.com/api/v1`).
3.  **Deployment Command**:
    ```sh
    npm run build
    ```
4.  **Automatic Deployment**: Vercel will automatically detect the Vite project and deploy it when you push to your repository.

### Manual Build

For other static site hosting services like Netlify or GitHub Pages:

```sh
npm run build
```
