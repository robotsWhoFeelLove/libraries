const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const Library = require("../models/library")

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
    const allBookInstances = await BookInstance.find().populate("book").exec();
  
    res.render("bookinstance_list", {
      title: "Book Instance List",
      bookinstance_list: allBookInstances,
    });
  });

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id)
        .populate("book")
        .populate("library")
        .exec();

    if (bookInstance === null) {
        const err = new Error("Book copy not found")
        err.status = 404
        return next(err);
    }
    res.render("bookinstance_detail", {
        title: "Book:",
        bookinstance: bookInstance,
    });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const [allBooks, allLibraries] = await Promise.all([
    Book.find({}, "title").exec(),
    Library.find({}, "name").exec(),
  ])

  res.render("bookinstance_form", {
    title:  "Create BookInstance",
    book_list: allBooks,
    library_list: allLibraries,
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    body("book", "Book must be specified").trim().isLength({ min: 1}).escape(),
        body("imprint", "Imprint must be specified")
            .trim()
            .isLength({ min: 1 })
            .escape(),
        body("status").escape(),
        body("due_back", "Invalid date")
            .optional({ values: "falsy"})
            .isISO8601()
            .toDate(),
            
        asyncHandler(async (req,res,next) => {
            const errors = validationResult(req);

            const bookInstance = new BookInstance({
                book: req.body.book,
                library: req.body.library,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back,
            });

            if (!errors.isEmpty()) {
                const allBooks = await Book.find({}, "title").exec();
                const allLibraries= await Library.find({}, "name").exec();

                res.render("bookinstance_form", {
                    title: "Create BookInstance",
                    book_list: allBooks,
                    library_list: allLibraries,
                    selected_book: bookInstance.book._id,
                    errors: errors.array(),
                    bookinstance: bookInstance,
                });
                return;
            } else {
                await bookInstance.save();
                res.redirect(bookInstance.url);
            }
        }),
];


exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const bookInstance = await BookInstance.findById(req.params.id)
        .populate("book")
        .exec();

    if (bookInstance === null) {
      // No results.
      res.redirect("/catalog/bookInstances");
    }
  
    res.render("bookinstance_delete", {
      title: "Delete Book Instance",
      bookInstance: bookInstance,
      
    });
  });


  // Handle Book Instance delete on POST.
  exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

    await BookInstance.findByIdAndRemove(req.body.bookinstanceid);
    res.redirect("/catalog/bookinstances");
    }
  );

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: BookInstance update GET");
    const [bookinstance, allBooks,allLibraries] = await Promise.all([
        BookInstance.findById(req.params.id)
        .populate("book")
        .populate("library")
        .exec(),
        Book.find({}, "title").exec(),
        Library.find({}, "name"),
    ]);

    if(bookinstance === null) {
        const err = new Error("Book Instance not found");
        err.status = 404;
        return next(err)
    }

    res.render("bookinstance_form", {
        title: "Update Book Instance",
        bookinstance: bookinstance,
        book_list: allBooks,
        library_list: allLibraries
    })

});

// Handle bookinstance update on POST.
// exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: BookInstance update POST");
// });

exports.bookinstance_update_post = [
    body("book", "Book must be specified").trim().isLength({ min: 1}).escape(),
        body("imprint", "Imprint must be specified")
            .trim()
            .isLength({ min: 1 })
            .escape(),
        body("status").escape(),
        body("due_back", "Invalid date")
            .optional({ values: "falsy"})
            .isISO8601()
            .toDate(),
            
        asyncHandler(async (req,res,next) => {
            const errors = validationResult(req);

            const bookInstance = new BookInstance({
                book: req.body.book,
                library: req.body.library,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back,
                _id: req.params.id,
            });

            if (!errors.isEmpty()) {
                const allBooks = await Book.find({}, "title").exec();
                const allLibraries = await Library.find({}, "name").exec();

                res.render("bookinstance_form", {
                    title: "Create BookInstance",
                    book_list: allBooks,
                    library_list: allLibraries,
                    selected_book: bookInstance.book._id,
                    errors: errors.array(),
                    bookinstance: bookInstance,
                });
                return;
            } else {
                const theInstance = await BookInstance.findByIdAndUpdate(req.params.id,bookInstance,{});
                // await bookInstance.save();
                res.redirect(theInstance.url);
            }
        }),
];

