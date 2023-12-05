var express = require("express");
var router = express.Router();

const mu = require("../db/MongoUtils.js");

const buildQuery = query => ({
  name: new RegExp(`.*${query}.*`, "i")
});

/* GET home page. */
router.get("/", function(req, res) {
  mu.teams.find().then(teams =>
    res.render("index", {
      teams
    })
  );
});

//  Data endpoint
router.get("/teams/:query", (req, res) => {
  console.log("params", req.params);
  const query = buildQuery(req.params.query);

  mu.teams.find(query).then(teams => res.json(teams));
});

router.post("/teams/create", (req, res) => {
  console.log("params", req.body);

  const team = {
    team_id: parseInt(req.body.team_id),
    team_name: req.body.team_name,
    score: parseFloat(req.body.score),
    players: JSON.parse(req.body.players),
    rounds: JSON.parse(req.body.rounds)
  };

  mu.teams.insert(team).then(res.redirect("/"));
});

// Server side rendering one team
router.get("/team/:id", (req, res) => {
  console.log("team/id params", req.params);

  mu.teams
    .findOneByID(parseInt(req.params.id))
    .then(team => {
      console.log("team", team);
      return team;
    })
    .then(team => res.render("team_details", { team }));
});

router.delete("/team/delete/:id", (req, res) => {
  const teamIdToDelete = parseInt(req.params.id);

  mu.teams.delete(teamIdToDelete);
});


module.exports = router;
