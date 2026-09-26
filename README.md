# fizzbite-www

Marketing website for **FizzBite**, a white-label mobile food & drinks ordering platform for cafés, shops and restaurants.

It is a static site (plain HTML, CSS and JS) with no build step.

## Files

| File          | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `index.html`  | Page content and sections                                      |
| `styles.css`  | All styles, including light/dark themes and responsive layout  |
| `script.js`   | Phone mockups, "See it in your colours" builder, nav, contact form |
| `favicon.svg` | Site icon                                                      |

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
# or
python -m http.server 8000
```

## Configuration

At the top of `script.js`:

- `FORM_ENDPOINT` is the URL that demo requests are POSTed to as JSON (for example a Formspree or Azure Function endpoint). If it's left empty, the form opens the visitor's email app instead.
- `CONTACT_EMAIL` is the address for demo requests.
- `CURRENCY` is the currency symbol used in the phone mockups.

Pricing lives in the `#pricing` section of `index.html`.

## Deploy

Upload the folder to any static host, such as Netlify, Vercel, GitHub Pages, Cloudflare Pages or Azure Static Web Apps.
