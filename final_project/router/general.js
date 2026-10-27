const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(404).json({ message: "User already exists!" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

/* ==================== TASKS 10 - 13: ASYNCHRONOUS IMPLEMENTATIONS WITH AXIOS & PROMISES ==================== */

// Task 10: Get all books using Promise callbacks or async-await with Axios
const getAllBooksAxios = async () => {
    try {
        const response = await axios.get("http://localhost:5000/");
        return response.data;
    } catch (error) {
        return books;
    }
};

function getBooksPromise() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

// Task 1 & Task 10: Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getBooksPromise();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Task 11: Get book details based on ISBN using Promise callbacks with Axios
const getBookByISBNAxios = (isbn) => {
    return axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => response.data)
        .catch(err => {
            return books[isbn] ? books[isbn] : null;
        });
};

function getBookByISBNPromise(isbn) {
    return new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });
}

// Task 2 & Task 11: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBNPromise(isbn)
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((err) => {
            return res.status(err.status || 404).json({ message: err.message });
        });
});

// Task 12: Get book details based on Author using async-await with Axios
const getBooksByAuthorAxios = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        let matchingBooks = [];
        let keys = Object.keys(books);
        keys.forEach((key) => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });
        return matchingBooks;
    }
};

function getBooksByAuthorPromise(author) {
    return new Promise((resolve, reject) => {
        let matchingBooks = [];
        let keys = Object.keys(books);
        keys.forEach((key) => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });
        resolve(matchingBooks);
    });
}

// Task 3 & Task 12: Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const matchingBooks = await getBooksByAuthorPromise(author);
        if (matchingBooks.length > 0) {
            return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
        } else {
            return res.status(404).json({ message: `No books found for author: ${author}` });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error searching books by author", error: error.message });
    }
});

// Task 13: Get book details based on Title using async-await with Axios
const getBooksByTitleAxios = async (title) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
        return response.data;
    } catch (error) {
        let matchingBooks = [];
        let keys = Object.keys(books);
        keys.forEach((key) => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });
        return matchingBooks;
    }
};

function getBooksByTitlePromise(title) {
    return new Promise((resolve, reject) => {
        let matchingBooks = [];
        let keys = Object.keys(books);
        keys.forEach((key) => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });
        resolve(matchingBooks);
    });
}

// Task 4 & Task 13: Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const matchingBooks = await getBooksByTitlePromise(title);
        if (matchingBooks.length > 0) {
            return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
        } else {
            return res.status(404).json({ message: `No books found with title: ${title}` });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error searching books by title", error: error.message });
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        if (!book.reviews || Object.keys(book.reviews).length === 0) {
            return res.status(200).json({ message: "No reviews found for this book." });
        }
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.general = public_users;
