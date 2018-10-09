const express = require('express');
const router  = express.Router();
const dateFormat = require('dateformat');
const { Books, Loans, Patrons } = require('../models');


// GET all loans
router.get('/', (req, res, next) => {
  Loans.findAll({
    include: [{model: Patrons}, {model: Books}],
    order: [["id", "DESC"]]
  }).then(loans => {
    res.render('loans/index', {loans, dateFormat});
  });
});

// GET form to create loan
router.get('/new', (req, res, next) => {
  Books.findAll().then(books => {
    Patrons.findAll().then(patrons => {
      res.render('loans/new', {
        books, 
        patrons, 
        loan: Loans.build(), 
        title: 'New Loan', 
        dateFormat
      });
    })
    .catch(err => {
      console.log(err);
    });
  })
  .catch(err => {
    console.log(err);
  });
});

// POST create loan
router.post('/', (req, res, next) => {
  Loans.create(req.body).then(loan => {
    res.redirect('/loans');
  })
  .catch(async err => {
    if (err.name === 'SequelizeValidationError') {
      res.render('loans/new', {
        books: await Books.findAll(),
        patrons: await Patrons.findAll(),
        loan: Loans.build(req.body),
        title: 'New Loan',
        dateFormat,
        errors: err.errors
      });
    } else {
      res.sendStatus(500);
    }
  });
});

// GET loan return form
router.get('/:id/return', async (req, res, next) => {
  const loan = await Loans.findById(req.params.id);
  const [book, patron] = await Promise.all([Books.findById(req.params.id), Patrons.findById(loan.patron_id)]);
  if (loan) {
    res.render('loans/return', {loan, patron, book, dateFormat});
  } else {
    res.sendStatus(404);
  }
});

// PUT return a loan / book
router.put('/:id', async (req, res, next) => {
  const loan = await Loans.findById(req.params.id);
  if (loan) {
    try {
      await loan.update(req.body);
    } catch(err) {
      if (err.name === 'SequelizeValidationError') {
        return res.render('loans/return', {
          loan,
          book: await Books.findById(loan.book_id),
          patron: await Patrons.findById(loan.patron_id),
          errors: err.errors,
          dateFormat
        });
      } else {
        return res.sendStatus(500);
      }
    }
    res.redirect('/loans');
  } else {
    return res.sendStatus(404);
  }
});


module.exports = router;
