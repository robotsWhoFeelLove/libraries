const Library = require("../models/library");
const Book = require("../models/book");
const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const Author = require("../models/author");
const { body, validationResult } = require("express-validator");
const { parse } = require('node-html-parser');

// Display list of all Genre.
exports.library_list = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: library list");
    const allLibraries = await Library.find().sort({name:1}).exec();
    res.render("library_list", {
        title: "Library List",
        library_list: allLibraries
    })
});

// Display detail page for a specific library.
exports.library_detail = asyncHandler(async (req, res, next) => {
//   res.send(`NOT IMPLEMENTED: library detail: ${req.params.id}`);
    const [library,allBookInstances,allAuthors] = await Promise.all([
        Library.findById(req.params.id).exec(),
        BookInstance.find({library:req.params.id})
            .populate("book")
            .populate({
                path: 'book',
                    populate: 'author'
            } )
            .exec(),
        Author.find().exec(),
    ]);
        // let allBooks= allBookInstances.forEach(book=> Book.findById(book.book))
    if (library === null) {
        const err = new Error("Library not found");
        err.status = 404;
        return next(err);
    }

    res.render("library_detail",{
        title: "Library: ",
        library: library,
        bookinstance_list: allBookInstances,
        author_list: allAuthors,
    })

});

// Display library create form on GET.
exports.library_create_get = (req, res, next) => {
    res.render("library_form",{title: "Create Library"})
  };

// Handle library create on POST.
// exports.library_create_post = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: library create POST");
// });

exports.library_create_post = [
    // Validate and sanitize the name field.
    body("name", "Library name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape(),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      const parseName = parse(req.body.name)
      // Create a genre object with escaped and trimmed data.
      const library = new Library({ name: parseName });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("library_form", {
          title: "Create library",
          library: library,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        
        const libraryExists = await Library.findOne({ name: parseName }).exec();
        if (libraryExists) {
          // Genre exists, redirect to its detail page.
          res.redirect(libraryExists.url);
        } else {
          await library.save();
          // New genre saved. Redirect to genre detail page.
          res.redirect(library.url);
        }
      }
    }),
  ];
  

// Display library delete form on GET.
exports.library_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: library delete GET");
});

// Handle library delete on POST.
exports.library_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: library delete POST");
});

// Display library update form on GET.
exports.library_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: library update GET");
});

// Handle library update on POST.
exports.library_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: library update POST");
});