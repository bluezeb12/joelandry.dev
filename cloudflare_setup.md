# Cloudflare Pages Setup & Deployment Guide

This document explains how to deploy your Next.js resume website to **Cloudflare Pages** by connecting it to your GitHub repository. It covers build configuration, compatibility flags, and setting up environment variables using the Cloudflare Dashboard and the Wrangler CLI.

> [!NOTE]
> Although your request mentioned GitHub Pages, GitHub Pages does not support server-side execution, dynamic routes (`/apply/[slug]`), middleware, API routes, or HTTP cookies. Thus, this project must be deployed to **Cloudflare Pages**, which provides full support for serverless/edge functions and dynamic Next.js applications.

---

## 1. Prerequisites

1. Your project is pushed to a remote **GitHub repository**.
2. You have a **Cloudflare account**.
3. You have the **Wrangler CLI** installed globally or locally in your project:
   ```bash
   npm install --save-dev wrangler
   ```

---

## 2. Connecting GitHub to Cloudflare Pages

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the sidebar, navigate to **Workers & Pages**.
3. Click the **Create Application** button.
4. Select the **Pages** tab, then click **Connect to Git**.
5. Log in to your GitHub account, authorize Cloudflare, and select your repository (`joelandry.dev`).
6. Click **Begin setup**.

---

## 3. Configuring Build Settings

In the **Configure build and deployments** screen, configure the following settings:

*   **Project Name:** `joelandry-dev` (or your preferred name)
*   **Production Branch:** `main` (or `master`)
*   **Framework Preset:** Select **Next.js**
*   **Build Command:** `npx @cloudflare/next-on-pages`
*   **Build Output Directory:** `.vercel/output/static`

> [!IMPORTANT]
> **Edge Runtime Requirements for Dynamic Routes:**
> Cloudflare Pages requires all dynamic (non-static) routes and middleware/proxies to be executed on the **Edge Runtime**. 
> 
> The project has already been updated to run on the **Edge Runtime** where required:
> *   [src/middleware.ts](file:///home/jdillan/Development/joelandry.dev/src/middleware.ts) (runs on Edge runtime by default; renamed from `proxy.ts` for Cloudflare builder compatibility)
> *   [src/app/api/auth/login/route.ts](file:///home/jdillan/Development/joelandry.dev/src/app/api/auth/login/route.ts) (API, exports `runtime = "edge"`)
> *   [src/app/apply/[slug]/page.tsx](file:///home/jdillan/Development/joelandry.dev/src/app/apply/[slug]/page.tsx) (Dynamic page, exports `runtime = "edge"`)
> *   [src/app/apply/[slug]/login/page.tsx](file:///home/jdillan/Development/joelandry.dev/src/app/apply/[slug]/login/page.tsx) (Login page, exports `runtime = "edge"`)
> 
> If you add more API endpoints or dynamic routes in the future, you must include `export const runtime = "edge";` in those files. If you add route-matching logic, add it to `src/middleware.ts`.

> [!IMPORTANT]
> **Compatibility Flag Required:**
> Next.js uses modern Node.js and runtime APIs. You **must** enable the `nodejs_compat` compatibility flag in Cloudflare Pages so it compiles successfully.
> 
> **How to enable it:**
> 1. Go to your Pages Project in the Cloudflare Dashboard.
> 2. Go to **Settings** > **Functions** (or **Settings** > **Builds & deployments** > **Compatibility flags**).
> 3. Add `nodejs_compat` under the **Production compatibility flags** and **Preview compatibility flags** inputs.

---

## 4. Setting Environment Variables & Secrets

Your tailored resume applications rely on environment variables for authentication (`COOKIE_SECRET` and passwords like `APP_PW_TEST_COMPANY`).

You can set these variables in two ways: via the Cloudflare Dashboard, or using the Wrangler CLI.

### Option A: Using the Wrangler CLI (Recommended for speed)

Wrangler lets you easily set environment secrets directly from your terminal. Run these commands from your local project root:

```bash
# Login to your Cloudflare account
npx wrangler login

# Set the Cookie Secret (used for signing HMAC cookies)
npx wrangler pages secret put COOKIE_SECRET

# Set a password for a specific application slug (e.g., test-company)
# Note: The secret name MUST match the APP_PW_<SLUG_UPPER> format
npx wrangler pages secret put APP_PW_TEST_COMPANY
```

*When prompted by wrangler, paste the secret value (e.g., your secure key or password).*

### Option B: Using the Cloudflare Pages Dashboard

1. Navigate to your Pages project in the Cloudflare Dashboard.
2. Go to **Settings** > **Environment variables**.
3. Under **Production** and **Preview**, click **Add variables**.
4. Define your variables:
   *   `COOKIE_SECRET` = `<your-hmac-key>`
   *   `APP_PW_TEST_COMPANY` = `testpass123`
5. Click **Save**.

---

## 5. Local Builds & Deploying Directly (Optional)

If you want to build and preview your application locally as it would run on Cloudflare Pages, or deploy it manually without waiting for Git CI:

### Add Build Script to `package.json`

Add a dedicated script to your `package.json` to run the Cloudflare build locally:

```json
"scripts": {
  "build:pages": "npx @cloudflare/next-on-pages"
}
```

### Local preview
To preview the build locally using the Wrangler dev server (which emulates the Cloudflare environment):

```bash
# First, build it using next-on-pages
npm run build:pages

# Then, run the wrangler emulation
npx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat
```

### Direct Manual Deployment
If you ever want to bypass Git and push the built files directly to Cloudflare:

```bash
# Deploy to production
npx wrangler pages deploy .vercel/output/static --project-name=joelandry-dev
```
