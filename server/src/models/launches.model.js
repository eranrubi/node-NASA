const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACE_X_API_URL = 'https://api.spacexdata.com/v4/launches/query';
const populateLaunches = async () => {
  console.log(`loadLaunchData start...`);
  const response = await axios.post(SPACE_X_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.error(`Problem with fetching SPACE-X launches`);
    throw new Error(`Launch fetching from SPACE-X failed, ${response.status}`);
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads?.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers: customers,
    };
    console.log(`#${launch.flightNumber}: ${launch.mission}`);
    await addNewLaunch(launch);
  }
};
const loadLaunchData = async () => {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('Launch data already loaded');
    return;
  } else {
    await populateLaunches();
  }
};

const findLaunch = async (filter) => {
  return await launchesDatabase.findOne(filter);
};

const getAllLaunches = async (skip, limit) => {
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
};

const setNewLaunch = async (launch) => {
  const nextFlightNumber = (await getLastFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    customer: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
    flightNumber: nextFlightNumber,
  });

  const planet = await planets.findOne({ keplerName: launch.target });
  if (!planet) {
    console.log(`couldn't find plant ${launch.target} in planet DB`);
    throw new Error('Planet was not found');
  }

  await addNewLaunch(newLaunch);
  //   console.log(`new launch: #${launch.flightNumber}`);
};

const removeLaunch = async (id) => {
  const launch = await launchesDatabase.findOne({ flightNumber: id });
  if (!launch) {
    return null;
  }

  const aborted = await launchesDatabase.findOneAndUpdate(
    { flightNumber: id },
    {
      success: false,
      upcoming: false,
    },
    { new: true }
  );

  return aborted;
};

const addNewLaunch = async (launch) => {
  try {
    await launchesDatabase.findOneAndUpdate(
      { flightNumber: launch.flightNumber },
      launch,
      { upsert: true }
    );
  } catch (err) {
    console.error(`Failed to save mission '${launch.mission}', ${err}`);
  }
};

const getLastFlightNumber = async () => {
  const lastFlightNumber = await launchesDatabase
    .findOne({})
    .sort('-flightNumber');
  if (!lastFlightNumber) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return lastFlightNumber.flightNumber;
};

module.exports = { loadLaunchData, getAllLaunches, setNewLaunch, removeLaunch };
