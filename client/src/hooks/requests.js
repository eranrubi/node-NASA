const API_URL = 'http://localhost:8000/v1';

async function httpGetPlanets() {
  // Load planets and return as JSON.
  const response = await fetch(`${API_URL}/planets`);
  return await response.json();
}

async function httpGetLaunches() {
  // Load launches, sort by flight number, and return as JSON.
  const response = await fetch(`${API_URL}/launches`);
  const fetchedLaunches = await response.json();
  return fetchedLaunches.sort((a, b) => a.flightNumber - b.flightNumber);
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  const body = JSON.stringify(launch);
  const response = await fetch(`${API_URL}/launches`, {
    method: 'POST',
    body: body,
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  });
  return await response.json();
}

async function httpAbortLaunch(id) {
  const response = await fetch(`${API_URL}/launches/${id}`, {
    method: 'DELETE',
  });
  return await response.json();
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
