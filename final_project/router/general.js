const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new customer
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(404).json({ message: "Customer already exists!" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

// Helper Promise: Task 10 - Get all books using Promise / async approach
const getAllBooks = () => {
    return new Promise((resolve, reject) => {
        try {
            resolve(books);
        } catch (error) {
            reject(error);
        }
    });
};

// Task 1 & Task 10: Get the book list available in the shop using Promise callbacks / async-await
public_users.get('/', function (req, res) {
    getAllBooks()
        .then((bookList) => {
            return res.status(200).send(JSON.stringify(bookList, null, 4));
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error fetching books", error: error.message });
        });
});

// Helper Promise: Task 11 - Get book details based on ISBN using Promise / async approach
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });
};

// Task 2 & Task 11: Get book details based on ISBN using Promise callbacks / async-await
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBN(isbn)
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((err) => {
            return res.status(err.status || 500).json({ message: err.message });
        });
});

// Helper Promise: Task 12 - Get book details based on author using Promise / async approach
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        try {
            const keys = Object.keys(books);
            const matchingBooks = [];
            keys.forEach((key) => {
                if (books[key].author.toLowerCase() === author.toLowerCase()) {
                    matchingBooks.push({ isbn: key, ...books[key] });
                }
            });
            resolve(matchingBooks);
        } catch (error) {
            reject(error);
        }
    });
};

// Task 3 & Task 12: Get book details based on author using Promise callbacks / async-await
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then((matchingBooks) => {
            if (matchingBooks.length > 0) {
                return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
            } else {
                return res.status(404).json({ message: `No books found for author: ${author}` });
            }
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error searching books by author", error: error.message });
        });
});

// Helper Promise: Task 13 - Get all books based on title using Promise / async approach
const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        try {
            const keys = Object.keys(books);
            const matchingBooks = [];
            keys.forEach((key) => {
                if (books[key].title.toLowerCase() === title.toLowerCase()) {
                    matchingBooks.push({ isbn: key, ...books[key] });
                }
            });
            resolve(matchingBooks);
        } catch (error) {
            reject(error);
        }
    });
};

// Task 4 & Task 13: Get all books based on title using Promise callbacks / async-await
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitle(title)
        .then((matchingBooks) => {
            if (matchingBooks.length > 0) {
                return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
            } else {
                return res.status(404).json({ message: `No books found with title: ${title}` });
            }
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error searching books by title", error: error.message });
        });
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.general = public_users;
