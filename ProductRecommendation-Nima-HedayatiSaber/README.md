# Product Recommendation System - Nima HedayatiSaber

Advanced product recommendation app using [FakeStoreAPI](https://fakestoreapi.com/).

## Features
- Fetch products from FakeStoreAPI
- LocalStorage caching for faster reloads
- Category filter
- Price range filter
- Debounced search by product name
- Related products by category
- Shopping cart (add / remove) with LocalStorage persistence
- Filters persisted in LocalStorage

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy
- Vercel: import this folder and deploy
- GitHub Pages: build then publish the `dist` folder
