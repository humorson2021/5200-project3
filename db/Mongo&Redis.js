const { MongoClient } = require('mongodb');
const { createClient } = require("redis");

// Connection URL
const url = 'mongodb://localhost:27017';
const databaseName = 'bridge';
const collectionName = 'teams';

async function ranking() {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    redisClient = await createClient()
      .on("error", (err) => console.log("Redis Client connection error " + err))
      .connect();

    await redisClient.del("RankOfTeams");

    const teamsToRank = [];

    try {
        const teams = await collection.find({}).toArray();
        for (const team of teams) {
            await redisClient.ZADD("RankOfTeams", [{score: team.score, value: team.team_id.toString()}]);
        }
        const res = await redisClient.ZRANGE("RankOfTeams", 0, -1);
        let n = res.length;
        for (let i = n - 1; i >= 0; i--) {
            const rankedTeam = await collection.find({team_id: {$eq: parseInt(res[i])}},{team_id:1, team_name:1}).toArray();
            teamsToRank.push({team_id: res[i], team_name: rankedTeam[0].team_name});
        }
        return teamsToRank;

    } finally {
        await redisClient.disconnect();
        await client.close();
    }
}

module.exports = ranking;