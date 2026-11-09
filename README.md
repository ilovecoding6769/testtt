# Website Template

A simple, responsive static website (HTML + CSS + JS) with dark mode, a mobile menu, and automatic deployment to **GitHub Pages**.

## Project structure

```
index.html                    Main page – edit your content here
css/style.css                 Styles (colors are variables at the top)
js/main.js                    Mobile menu, dark mode, footer year
assets/favicon.svg            Browser tab icon
.github/workflows/deploy.yml  Auto-deploys to GitHub Pages
```

## Run it locally

Just open `index.html` in your browser. Or serve it:

```bash
npx serve .
```

or

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Put it on GitHub (and live on the web)

1. Create a new **empty** repository on https://github.com/new (e.g. `my-website`).
2. Upload the files, using **one** of these options:

   **Option A: with Git** (install it from https://git-scm.com first). In this folder, run (replace `YOUR-USERNAME`):

   ```bash
   git init -b main
   ```

   ```bash
   git add -A
   ```

   ```bash
   git commit -m "Initial website"
   ```

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/my-website.git
   ```

   ```bash
   git push -u origin main
   ```

   **Option B: without Git.** On the new repo page, click **uploading an existing file** and drag in all the files and folders.
   Note: the browser can skip hidden folders like `.github`. If it does, click **Add file → Create new file**, name it
   `.github/workflows/deploy.yml`, and paste in the contents of that file.

3. On GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Go to the **Actions** tab — the "Deploy to GitHub Pages" workflow runs on every push to `main`.
   (If the first run failed because Pages wasn't enabled yet, click **Re-run jobs**.)
5. Your site will be live at `https://YOUR-USERNAME.github.io/my-website/`.

## Customize

- Change the site name, text and email in `index.html`.
- Change colors in the `:root` block at the top of `css/style.css`.
- Add more pages by creating new `.html` files (e.g. `about.html`) and linking to them.
