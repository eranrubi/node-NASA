const {
  getAllLaunches,
  setNewLaunch,
  removeLaunch,
} = require('../../models/launches.model');
const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpPostLaunch(req, res) {
  const newLaunch = req.body;
  if (!verifyLaunchProperties(newLaunch)) {
    return res.status(400).json({ error: 'Missing required launch property' });
  }

  if (!verifyDateFormat(newLaunch.launchDate)) {
    return res.status(400).json({ error: 'Invalid Date format' });
  }

  newLaunch.launchDate = new Date(newLaunch.launchDate);
  // try {
  await setNewLaunch(newLaunch);
  return res.status(201).json(newLaunch);
  // } catch (err) {
  //   return res.status(400).json(err);
  // }
}

async function httpRemoveLaunch(req, res) {
  const launchIdToRemove = Number(req.params.id);
  const aborted = await removeLaunch(launchIdToRemove);
  if (!aborted) {
    return res.status(404).json({ error: 'launch id was not found' });
  }

  return res.status(200).json(aborted);
}

const verifyLaunchProperties = (launch) => {
  // console.log(
  //   `${launch.mission}, ${launch.rocket}, ${launch.launchDate}, ${launch.target}`
  // );
  return !(
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  );
};

const verifyDateFormat = (date) => {
  const parsedDate = Date.parse(date);
  return !isNaN(parsedDate);
};

module.exports = {
  httpGetAllLaunches,
  httpPostLaunch,
  httpRemoveLaunch,
};
