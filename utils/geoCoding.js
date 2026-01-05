require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("../models/listing");

const geocoding = async (location) => {
  try {
    const res = await axios.get("https://api.geoapify.com/v1/geocode/search", {
      params: { text: location, apiKey: process.env.GEOAPIFY_KEY, limit: 1 },
    });
    const feats = res.data.features;
    if (!feats || !feats.length) return null;
    const { lon, lat } = feats[0].properties;
    return { type: "Point", coordinates: [lon, lat] };
  } catch (err) {
    console.error("Geoapify error for location:", location, err.message);
    return null;
  }
};


const updateAllListings = async () => {
  try {
    console.log("MongoDB connected for updating listings");

    const listings = await Listing.find({});
    for (let listing of listings) {
      const geometry = await geocoding(listing.location);
      if (geometry) {
        listing.geometry = geometry;
        await listing.save();
        console.log("Updated:", listing.title);
      } else {
        console.log("Not Found:", listing.title);
      }
    }

    mongoose.connection.close();
    console.log("All done!");
  } catch (err) {
    console.error("Error updating listings:", err.message);
    mongoose.connection.close();
  }
};

module.exports = { geocoding, updateAllListings };





