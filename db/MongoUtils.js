const MongoClient = require("mongodb").MongoClient;
// const ObjectID = require("mongodb").ObjectID;
const redis = require("redis");
const redisClient = redis.createClient();

function MongoUtils() {
  const mu = {},
    hostname = "localhost",
    port = 27017,
    dbName = "bridge",
    colName = "teams";

  mu.connect = () => {
    const client = new MongoClient(`mongodb://${hostname}:${port}`, {
      useUnifiedTopology: true
    });
    return client.connect();
  };

  mu.teams = {};

  const updateRank = (team) => {
    redisClient.zAdd("RankOfTeams", [{score: team.score, value: team.team_id}]);
  };

  mu.teams.find = query =>
    mu.connect().then(client => {
      const teamsCol = client.db(dbName).collection(colName);

      console.log("query", query);

      return teamsCol
        .find(query)
        .limit(10)
        .sort({ team_id: 1 })
        .toArray()
        .finally(() => client.close());
    });

  mu.teams.findOneByID = id =>
    mu.connect().then(client => {
      const teamsCol = client.db(dbName).collection(colName);

      // when searching by id we need to create an ObjectID
      return teamsCol
        .findOne({ team_id: id })
        .finally(() => client.close());
    });

  mu.teams.insert = team =>
    mu.connect().then(client => {
      const teamsCol = client.db(dbName).collection(colName);

      return teamsCol.insertOne(team).finally(() => {
        updateRank(team);
        client.close();
      });

    });

  mu.teams.delete = teamIdToDelete =>
    mu.connect().then(client => {
      const teamsCol = client.db(dbName).collection(colName);

      return teamsCol.deleteOne({"team_id": teamIdToDelete}).finally(() => {
        redisClient.zRem("RankOfTeams", teamIdToDelete);
        client.close();
      });
    });

  mu.teams.getRank = () => {
    const res = redisClient.zRange("RankOfTeams", 0, -1);
    const teams = [];
    for (let i = res.length - 1; i >= 0; i--) {
      let curTeamId = res[i];
      teams.push({team_id: curTeamId});
    }
    return teams;// a list of team ids with ranking
  };

  return mu;

}

module.exports = MongoUtils();
