const express = require('express');
const router  = express.Router();
const { Books, Loans, Patrons } = require('../models');


// GET form create loan
router.get('/new', (req, res, next) => {
  res.render('loans/new', {loan: Loans.build(), title: 'New Loan'});
});


module.exports = router;
