# Food Gardening Support System (Demo)

This is a simple front-end demo based on the provided UML diagram. It includes:

- Login page (`index.html`) with client-side registration/authentication (localStorage)
- Home page (`home.html`) with navigation to:
  - Educational Resources (`educational.html`)
    - How to plant efficiently (`planting.html`)
    - How to make soil fertile (`soil.html`)
  - Profitability Calculator (`profitability.html`)
    - How to make soil fertile (`soil.html`)
  - Area to Plant Calculator (`area.html`)

## How to run locally

From the `Food Gardening` directory:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

- Register a username and password to log in.
- All navigation is client-side only; authentication is not secure (for demo only).
- All pages except login are protected and require login.
