const mongoose = require("mongoose");
const Listing = require("./models/listing");  // path sahi rakhna

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

async function deleteListing() {
  try {
    // Yaha title change kar do jis listing ko delete karna hai
    await Listing.deleteOne({ title: "dfdfv" });

    console.log("Listing deleted!");
  } catch (err) {
    console.log("Error: ", err);
  } finally {
    mongoose.connection.close();
  }
}

deleteListing();
