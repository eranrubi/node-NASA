const express = require('express');
const {
  httpGetAllLaunches,
  httpPostLaunch,
  httpRemoveLaunch,
} = require('./launches.controller');

const launchesRouter = express.Router();

launchesRouter.get('/launches', httpGetAllLaunches);

launchesRouter.post('/launches', httpPostLaunch);

launchesRouter.delete('/launches/:id', httpRemoveLaunch);

module.exports = launchesRouter;
