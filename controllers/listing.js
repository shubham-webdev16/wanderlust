const Listing = require("../models/listing");
const { geocoding }  = require("../utils/geocoding.js");

// Show listing
module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: { path: "author" }
    });

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// Index
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// New form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Create listing + Geoapify
module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  let savedListing = await newListing.save();

  // Geocode after saving listing
  if (req.body.listing.location) {
    const geometry = await geocoding(req.body.listing.location);
    if (geometry) {
      savedListing.geometry = geometry;
      await savedListing.save();
    }
  }

  req.flash("success", "New Listing Created!");
  res.redirect(`/listings/${savedListing._id}`);
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists!");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

// Update + Geoapify
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // New image
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }

  // Re-geocode if location changed
  if (req.body.listing.location) {
    const geometry = await geocoding(req.body.listing.location);
    listing.geometry = geometry;
  }
  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${listing._id}`);
}

  

// Delete
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};


