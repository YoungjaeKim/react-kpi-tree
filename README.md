# react-kpi-tree

This project is just my teatime coding to train Javascript realm (React.js, Typescript, express.js, etc).

The `kpi-tree` is widely used KPI(Key Performance Index) management dashboard in order to track required business achievements.

## Dependencies
- https://github.com/wbkd/react-flow

## How to Config
1. Go to `/backend` and Copy `.env.example` file to `.env`.
2. Change the following environment variables if you want.

```
PORT=8080
MONGODB_DEV=mongodb://localhost:27017/dev
MONGODB_PRODUCTION=mongodb://localhost:27017/production
```

## Tech Stack
- React + express.js + MongoDB

## How to Build

1. Go to `/backend` and run `npm install`.
2. Go to `/frontend` and run `npm install`.
3. Open your browser and go to `http://localhost:3000`.

## To Do (as of 2025-05-05)
- [ ] Node
  - [v] Hide Node
  - [ ] Edit Node
  - [v] Unhide Node
  - [v] Reflect recent Element value on Node label
- [ ] Edge
  - [v] Remove Edge
- [ ] Element
  - [ ] Update Element
  - [ ] Show a newest Element value periodically
- [ ] Change MongoDB to PostgreSQL
- [ ] Add more test cases
- [ ] Group
  - [ ] Create new Group
  - [ ] Archive a Group