const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");
const Library = require("../models/library")


const asyncHandler = require("express-async-handler");

index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
    numLibraries,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: "Available" }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
    Library.countDocuments({}).exec()
  ]);

  res.render("index", {
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
    library_count: numLibraries,
  });
});


// Display list of all books.
book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title author")
    .sort({title: 1})
    .populate("author")
    .exec();

    res.render("book_list", {title: "Book List", book_list: allBooks});
});

// Display detail page for a specific book.
book_detail = asyncHandler(async (req, res, next) => {
    const [book,bookinstances] = await Promise.all([

        Book.findById(req.params.id).populate("author").populate("genre").exec(),
            BookInstance.find({ book: req.params.id}).exec(),
    ]);
    if(book === null){
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
    }

    res.render("book_detail", {
        title: book.title,
        book: book,
        book_instances: bookinstances,
    });
});

// Display book create form on GET.
book_create_get = asyncHandler(async (req, res, next) => {
    const [allAuthors, allGenres] = await Promise.all([
        Author.find({}).exec(),
        Genre.find({}).exec(),
    ])
  res.render("book_form",{
    title: "Create Book",
    authors: allAuthors,
    genres: allGenres,
  })
});

// Handle book create on POST.
book_create_post = [
    (req,res,next) => {
        if(!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === "undefined")
req.body.genre = [];
            else req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    body("title", "Title must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("author", "Author must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
        body("isbn", "ISBN must not be empty").trim().isLength({
    min: 1 }).escape(),
        body("genre.*").escape(),

        asyncHandler(async (req,res,next) => {
            const errors = validationResult(req);

            const book = new Book({
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: req.body.genre,
            });

        if (!errors.isEmpty()) {
            const [allAuthors, allGenres] = await Promise.all([
                Author.find().exec(),
                Genre.find().exec(),
            ]);

            for (const genre of allGenres) {
                if (book.genre.indexOf(genre._id) > -1) {
                    genre.checked = "true";
                }
            }
            res.render("book_form", {
                title: "Create Book",
                authors: allAuthors,
                genres: allGenres,
                book: book,
                errors: errors.array(),
            });
        } else {
            await book.save();
            res.redirect(book.url);
        }
    }),       
];

// Display book delete form on GET.
// book_delete_get = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: Book delete GET");
// });

book_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [book, allBookInstances] = await Promise.all([
      Book.findById(req.params.id).populate("author").populate("genre").exec(),
      BookInstance.find({ book: req.params.id }).exec(),
    ]);
  
    if (book === null) {
      // No results.
      res.redirect("/catalog/books");
    }
  
    res.render("book_delete", {
      title: "Delete Book",
      book: book,
      book_instances: allBookInstances,
    });
  });

// Handle book delete on POST.
// book_delete_post = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: Book delete POST");
// });

book_delete_post = asyncHandler(async (req, res, next) => {
    const [book, allBookInstances] = await Promise.all([
        Book.findById(req.params.id).populate("author").populate("genre").exec(),
        BookInstance.find({ book: req.params.id }).exec(),
      ]);

    if(allBookInstances.length > 0) {
        res.render("book_delete", {
            title: "Delete Book",
            book: book,
            book_instances: allBookInstances,
        });
        return
    } else {
        await Book.findByIdAndRemove(req.body.bookid);
        res.redirect("/catalog/books");
    }
  });
  


// Display book update form on GET.
book_update_get = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: Book update GET");
    const [book,allAuthors,allGenres] = await Promise.all([
        Book.findById(req.params.id).populate("author").populate("genre").exec(),
        Author.find().exec(),
        Genre.find().exec(),
    ])

    if (book === null) {
        const err = new Error("Book not found")
        err.status = 404;
        return next(err);
    }

    for (const genre of allGenres){
        for (const book_g of book.genre) {
            if (genre._id.toString() === book_g._id.toString()) {
                genre.checked = "true";
            }
        }
    }

    res.render("book_form", {
        title: "Update Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
    });
});

// Handle book update on POST.
// book_update_post = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: Book update POST");
// });

// Handle book update on POST.
book_update_post = [
    // Convert the genre to an array.
    (req, res, next) => {
      if (!(req.body.genre instanceof Array)) {
        if (typeof req.body.genre === "undefined") {
          req.body.genre = [];
        } else {
          req.body.genre = new Array(req.body.genre);
        }
      }
      next();
    },
  
    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("author", "Author must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("summary", "Summary must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
    body("genre.*").escape(),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a Book object with escaped/trimmed data and old id.
      const book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
  
        // Get all authors and genres for form
        const [allAuthors, allGenres] = await Promise.all([
          Author.find().exec(),
          Genre.find().exec(),
        ]);
  
        // Mark our selected genres as checked.
        for (const genre of allGenres) {
          if (book.genre.indexOf(genre._id) > -1) {
            genre.checked = "true";
          }
        }
        res.render("book_form", {
          title: "Update Book",
          authors: allAuthors,
          genres: allGenres,
          book: book,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid. Update the record.
        const thebook = await Book.findByIdAndUpdate(req.params.id, book, {});
        // Redirect to book detail page.
        res.redirect(thebook.url);
      }
    }),
  ];
  

module.exports = { index, book_list, book_detail, book_create_get, book_create_post, book_delete_get, book_update_get, book_delete_post, book_update_post };
