const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            console.log("User list after registration:", users); // Debugging line
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book (list available in the shop
public_users.get('/', function (req, res) {
    const get_books = new Promise((resolve, reject) => { 
        resolve(books); 
    });

    get_books
        .then(bookList => {
            res.send(JSON.stringify(bookList, null, 4));  
            console.log("Get Book list");
        })
        .catch(error => {
            res.status(500).send("An error occurred while fetching books."); 
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const get_isbn = new Promise((resolve, reject) => {
        const isbn = req.params.isbn;
        if (books[isbn]) {  
            resolve(books[isbn]);  
        } else {
            reject("ISBN not found!");  
        }
    });

    get_isbn
        .then(book => {
            res.send(book);  
            console.log("Promise resolved!");
        })
        .catch(error => {
            res.status(404).send(error);
            console.log("Promise rejected!");
        });
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const get_author = new Promise((resolve, reject) => {
        let booksbyauthor = [];
        let isbns = Object.keys(books);
        isbns.forEach((isbn) => {
            if (books[isbn]["author"] === req.params.author) {
                booksbyauthor.push({
                    "isbn": isbn,
                    "title": books[isbn]["title"],
                    "reviews": books[isbn]["reviews"]
                });
            }
        }); 
        if (booksbyauthor.length > 0) {
            resolve(booksbyauthor);
        } else {
            reject("Author not found!");
        }
    });  
    get_author
        .then(booksbyauthor => {
            res.send(JSON.stringify({ booksbyauthor }, null, 4));
            console.log("Author found and response sent.");
        })
        .catch(error => {
            res.status(404).send(error);
            console.log("Author not found.");
        });
});
  

// Get book details based on title
public_users.get('/title/:title',function (req, res) {
    const get_title = new Promise((resolve, reject) => { 
        let booksbytitle = [];
        let isbns = Object.keys(books);
        isbns.forEach((isbn) => {
          if(books[isbn]["title"] === req.params.title) {
            booksbytitle.push({"isbn":isbn,
                                "author":books[isbn]["author"],
                                "reviews":books[isbn]["reviews"]});
          }
        });
        if (booksbytitle.length > 0) {
            resolve(booksbytitle);
        } else {
            reject("Title not found!");
        }
    });  
    get_title
        .then(booksbytitle => {
            res.send(JSON.stringify({ booksbytitle }, null, 4));
            console.log("Title found!.");
        })
        .catch(error => {
            res.status(404).send(error);
            console.log("Title not found.");
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn;
    let bookreviews = [];

    // Check if the book exists
    if (books[isbn]) {
        // If it exists, add the reviews to bookreviews
        bookreviews = books[isbn]["reviews"] || [];
    }

    // Send the book reviews as JSON response
    res.send(JSON.stringify({ bookreviews }, null, 4));
});

module.exports.general = public_users;
