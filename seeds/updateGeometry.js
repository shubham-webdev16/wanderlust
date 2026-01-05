require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("../models/listing"); 
const { geocoding } = require("../utils/geocoding");
// relative path from seeds folder

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to Atlas for seeding")
}
  const updateAllListings = async () => {
    try {
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

      console.log("All listings processed!");

    } catch (err) {
    console.error("Error updating listings:", err.message);
  } finally {
    // Close connection if we opened it
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    }
  }
};

main();
// Geoapify geocoding function
const geocoding = async (location) => {
  if (!location) return null;
  try {
    const res = await axios.get("https://api.geoapify.com/v1/geocode/search", {
      params: {
        text: location,
        apiKey: process.env.GEOAPIFY_KEY,
        limit: 1
      }
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

// Main function to update all listings


// Run the update
updateAllListings();
