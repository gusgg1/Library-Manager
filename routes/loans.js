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


module.exports = router;
