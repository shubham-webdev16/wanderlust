const Listing = require("../models/listing");
const geocode  = require("../utils/geoCoding");

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
 const location = req.body.listing.location;
 const geometry = await geocode(location);

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  if(geometry) {
    newListing.geometry = geometry;
  }
  let savedListing = await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect(`/listings/${id}`);
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
    const geometry = await geocode(req.body.listing.location);
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


