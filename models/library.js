const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LibrarySchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 
  }
});

// Virtual for book's URL
LibrarySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/library/${this._id}`;
});

// Export model
module.exports = mongoose.model("Library", LibrarySchema);
