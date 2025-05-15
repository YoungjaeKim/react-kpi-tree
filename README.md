# react-kpi-tree

This project is just my teatime coding to train Javascript realm (React.js, Typescript, express.js, etc).

The `kpi-tree` is widely used KPI(Key Performance Index) management dashboard in order to track required business achievements.

## Dependencies
- React.js
- https://github.com/wbkd/react-flow
- Node.js + MongoDB

## How to Build and Config
1. Frontend (/frontend) - React.js
   - Go to [/frontend](/frontend) and Copy `.env.example` file to `.env`.
```dotenv
REACT_APP_API_URL=http://localhost:8080
```

2. Backend (/backend) - express.js
   - Go to [/backend](/backend) and Copy `.env.example` file to `.env`.
```dotenv
PORT=8080  # Port for express.js (exposed for frontend)
MONGODB_URI=mongodb://localhost:27017/dev
EXTERNAL_CONNECTIONS_CONFIG_PATH=./config/external-connections.json  # external connections config file
```

3. External Connections (/backend/config)

  - Go to [/backend/config](/backend/config)

The external connection is an adapter to pull data from external sources. Currently, we are supporting OpenSearch and http json.
Each `connection` put a data to an `Element` (data object of Node).

Below is an example of `external-connections.json` file.

```json
{
  "connections": [
    {
      "name": "Daily Sales OpenSearch",
      "elementId": "682033882dc6d8422bde498a",
      "type": "OpenSearch",
      "parameters": {
        "query": {
          "match": {
            "description": "delivery"
          }
        }
      },
      "url": "http://localhost:9200",
      "username": "",
      "authToken": "",
      "pollingPeriodSeconds": 20,
      "enable": true
    },
    {
      "name": "Service uptime",
      "elementId": "682033882dc6d8422bde438f",
      "type": "Json",
      "parameters": {
        "jsonPath": "$.products[0].name"
      },
      "url": "http://example.com/api/health",
      "username": "",
      "authToken": "",
      "pollingPeriodSeconds": 60,
      "enable": true
    }
  ]
}
```

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
