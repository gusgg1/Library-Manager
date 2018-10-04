const express = require('express');
const router  = express.Router();
const { Books, Loans, Patrons } = require('../models');


// GET all patrons
router.get('/', (req, res, next) => {
  Patrons.findAll().then(patrons => {
    res.render('patrons/index', {patrons});
  });
});

// GET patron form
router.get('/new', function(req, res, next) {
  res.render('patrons/new', {patron: Patrons.build(), title: 'New Patron'});
});

// POST create patron
router.post('/', (req, res, next) => {
  Patrons.create(req.body).then(patron => {
    res.redirect('/patrons');
  })
  .catch(err => {
    if (err.name === 'SequelizeValidationError') {
      res.render('patrons/new', {
        patron: Patrons.build(req.body),
        title: 'New Patron',
        errors: err.errors
      });
    } else {
      throw err;
    }
  })
  .catch(err => {
    res.sendStatus(500);
  });
});


module.exports = router;