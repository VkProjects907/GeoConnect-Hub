require("dotenv").config();
const axios = require("axios");
const HttpError = require("../models/http-error");
const API_KEY = process.env.GEOAPIFY_API_KEY;

async function getCoordsForAddress(address) {
  const response = await axios.get(
    "https://api.geoapify.com/v1/geocode/search",
    {
      params: {
        text: address,
        apiKey: API_KEY,
      },
    },
  );

  if (response.data.features.length === 0) {
    throw new HttpError("Could not find location for address.", 422);
  }

  const location = response.data.features[0];

  return {
    lat: location.properties.lat,
    lng: location.properties.lon,
  };
}

module.exports = getCoordsForAddress;
