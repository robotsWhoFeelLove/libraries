const Library = require("../models/library");
const Book = require("../models/book");
const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const Author = require("../models/author");

// Display list of all Genre.
exports.library_list = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: library list");
    const allLibraries = await Library.find().sort({name:1}).exec();
    res.render("library_list", {
        title: "Library List",
        library_list: allLibraries
    })
});

// Display detail page for a specific Genre.
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
exports.library_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: library create GET");
});

// Handle library create on POST.
exports.library_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: library create POST");
});

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