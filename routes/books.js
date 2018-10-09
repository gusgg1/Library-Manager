const express = require('express');
const router  = express.Router();
const dateFormat = require('dateformat');
const { Sequelize, Books, Loans, Patrons } = require('../models');


/* GET all books */
router.get('/', function(req, res, next) {
  if (req.query.filter === 'overdue') {
    Books.findAll().then(function(books) {
      console.log(req.query);
      res.render('books/index', {books});
    });
  }
});

// GET overdue books
// router.get('/', (req, res, next) => {
//   if (req.query.filter === 'overdue') {
//     res.send('YES');
//   }
// });

/* GET form to create book. */
router.get('/new', function(req, res, next) {
  res.render('books/new', { book: Books.build(), title: 'New Book' });  
});

/* POST create book */
router.post('/', function(req, res, next) {
  Books.create(req.body).then(function(book) {
    res.redirect('/books');
  }).catch(err => {
    if (err.name === 'SequelizeValidationError') {
      res.render('books/new', {
        book: Books.build(req.body),
        title: 'New book',
        errors: err.errors
      });
    } else {
      throw err;
    }
  }).catch(err => {
    res.sendStatus(500);
  });
});

/* GET specific book */
router.get('/:id', async (req, res, next) => {
  const [book, loans] = await Promise.all([
    Books.findById(req.params.id),
    Loans.findAll({
      where: { book_id: req.params.id },
      include: [{ model: Patrons }]
    })
  ]);
  if (!book) {
    return res.sendStatus(404);
  }
  return res.render('books/show', {title: book.tile, book, loans, dateFormat});
});

/* PUT update book */
router.put('/:id', function(req, res, next) {
  Books.findById(req.params.id).then(function(book) {
    return book.update(req.body);
  }).then(function(book) {
    res.redirect('/books');
  }).catch(function(err) {
    if (err.name === 'SequelizeValidationError') {
      const book = Books.build(req.body);
      book.id = req.params.id;

      res.render('books/show', {title: book.title, book, errors: err.errors});
    } else {
      throw err;
    }
  }).catch(function(err) {
    res.send(500);
  })
});

// GET delete form
router.get('/:id/delete', (req, res, next) => {
  Books.findById(req.params.id).then(book => {
    if (book) {
      res.render('books/delete', {book, title: 'Delete Book'});
    } else {
      res.sendStatus(404);
    }
  })
  .catch(err => {
    res.sendStatus(500);
  });
});

// DELETE book
router.delete('/:id', (req, res, next) => {
  Books.findById(req.params.id).then(book => {
    if (book) {
      return book.destroy();
    } else {
      res.sendStatus(404);
    }
  })
  .then(() => {
    res.redirect('/books');
  })
  .catch(err => {
    res.sendStatus(500);
  });
});


module.exports = router;
