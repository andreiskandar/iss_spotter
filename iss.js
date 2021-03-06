const request = require('request');
// const ipAPI = 'https://ipinfo.io/json';
const ipAPI = 'https://api.ipify.org?format=json';
const coordsAPI = `https://ipvigilante.com/json/`;

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const fetchMyIP = callback => {
	// use request to fetch IP address from JSON API
	request(ipAPI, (err, response, body) => {
		if (err) return callback(err, null);
		if (response.statusCode !== 200) {
			const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
			return callback(Error(msg), null);
		}

		const ip = JSON.parse(body).ip;
		return callback(null, ip);
	});
};

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchCoordsByIP = (ip, callback) => {
	request(coordsAPI + ip, (err, response, body) => {
		if (err) {
			return callback(Error('stuck'), null);
		}
		if (response.statusCode !== 200) {
			const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${response}`;

			return callback(Error(msg), null);
		}

		const { latitude, longitude } = JSON.parse(body).data;
		// const data = JSON.parse(body);
		return callback(null, { latitude, longitude });
	});
};

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = (coords, callback) => {
	const latitude = coords.latitude;
	const longitude = coords.longitude;
	const ISSFlyOverAPI = `http://api.open-notify.org/iss-pass.json?lat=${latitude}&lon=${longitude}`;

	request(ISSFlyOverAPI, (err, response, body) => {
		if (err) {
			return callback(err, null);
		}
		if (response.statusCode !== 200) {
			const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${response}`;
			return callback(Error(msg), null);
		}
		const passes = JSON.parse(body).response;
		return callback(null, passes);
	});
};

// const coordsAPI = 'http://ip-api.com/json/';
const nextISSTimesForMyLocation = lastCallback => {
	fetchMyIP((err, ip) => {
		if (err) {
			lastCallback(err, null);
			return;
		}

		fetchCoordsByIP(ip, (err, coords) => {
			if (err) {
				lastCallback(err, null);
				return;
			}

			fetchISSFlyOverTimes(coords, (err, passes) => {
				if (err) {
					lastCallback(err, null);
					return;
				}
				lastCallback(null, passes);
			});
		});
	});
};

module.exports = { nextISSTimesForMyLocation };
