#! /usr/bin/env node

console.log(
    'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Library = require("./models/library");
 
  
  const libraries = [];

  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false); // Prepare for Mongoose 7
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createLibraries();

    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // genre[0] will always be the Fantasy genre, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function libraryCreate(index, name) {
    const library = new Library({ name: name });
    await library.save();
    libraries[index] = library;
    console.log(`Added library: ${name}`);
  }

  
  async function createLibraries() {
    console.log("Adding libraries");
    await Promise.all([
    //   libraryCreate(0, "Ian and Sarah's"),
      libraryCreate(2, "Test Library"),
    ]);
  }

  