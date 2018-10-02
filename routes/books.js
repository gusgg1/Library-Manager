const express = require('express');
const router  = express.Router();
const { Books, Loans, Patrons } = require('../models');


/* GET books form to create book. */
router.get('/new', function(req, res, next) {
  res.render('books/new', { title: 'New Book' });  
});

/* POST create book */
router.post('/', function(req, res, next) {
  Books.create(req.body).then(function(book) {
    res.redirect('/');
  });
});

/* GET all books */
router.get('/', function(req, res, next) {
  Books.findAll().then(function(books) {
    res.render('books/show', {books});
  });
});

module.exports = router;
