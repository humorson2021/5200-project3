# nodeExpressEJSMongo

Consist of a main page for teams with creating new team (for players and rounds, easy input is "[]") aside, detail page for every team and delete button for every team. (upon project 2)

a link to rank page shows current ranking.

# Install

```
cd nodeExpressEJSMongo
yarn install
yarn start
```

Expects a Mongo Server to be running on `mongodb://localhost:27017`, and it uses a database called "lotteryTests" with a collection "grades" that has three attributes: name, grade and timestamp.
