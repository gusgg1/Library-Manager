const express = require('express');
const router  = express.Router();
const dateFormat = require('dateformat');
const { Sequelize, Books, Loans, Patrons } = require('../models');


// GET all patrons
router.get('/', (req, res, next) => {
  let options = {
    order: [['last_name', 'asc']],
    limit: 10,
    offset: 0,
    where: {}
  };

  if (req.query.page) {
    options.limit = 10;
    options.offset = (req.query.page - 1) * options.limit;
  }

  if (req.query.q) {
    options.where = {
      [Sequelize.Op.or]: [
        {
          first_name: {
            [Sequelize.Op.like]: `%${req.query.q.toLowerCase()}%`
          }
        },
        {
          last_name: {
            [Sequelize.Op.like]: `%${req.query.q.toLowerCase()}%`
          }
        },
        {
          library_id: {
            [Sequelize.Op.like]: `%${req.query.q.toLowerCase()}%`
          }
        }
      ]
    };
  }

  Patrons.findAndCountAll(options)
    .then(patrons => {
      let totalPatrons = patrons.count;
      let pageSize = 10;
      let pages = Math.ceil(totalPatrons / pageSize);
      res.render('patrons/index', {
        patrons: patrons.rows,
        totalPatrons,
        pageSize,
        pages
      });
    })
    .catch(err => {
      res.sendStatus(500);
    });
});

// GET patron form create
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

// GET specific patron
router.get('/:id', async (req, res, next) => {
  const [patron, loans] = await Promise.all([
    Patrons.findById(req.params.id),
    Loans.findAll({ where: { patron_id: req.params.id }, include: [{ model: Books }] })
  ]);
  if (patron) {
    res.render('patrons/show', { patron, loans, dateFormat });
  } else {
    res.sendStatus(404);
  }
});

// PUT update / edit patron
router.put('/:id', async (req, res, next) => {
  const patron = await Patrons.findById(req.params.id);
  if (patron) {
    try {
      await patron.update(req.body);
    } catch (err) {
      if (err.name === 'SequelizeValidationError') {
        const loans = await Loans.findAll({ 
          where: { patron_id: patron.id }, include: [{ model: Books }]
        });
        return res.render('patrons/show', {
          patron, 
          loans, 
          errors: err.errors,
          dateFormat 
        });
      } else {
        return res.sendStatus(500);
      }
    }
    return res.redirect('/patrons');
  } else {
    return res.send(404);
  }
});

// GET delete form
router.get('/:id/delete', (req, res, next) => {
  Patrons.findById(req.params.id).then(patron => {
    if (patron) {
      res.render('patrons/delete', {patron, title: 'Delete Patron'});
    } else {
      res.sendStatus(404);
    }
  })
  .catch(err => {
    res.sendStatus(500);
  });
});

// DELETE patron
router.delete('/:id', (req, res, next) => {
  Patrons.findById(req.params.id).then(patron => {
    if (patron) {
      return patron.destroy();
    } else {
      res.sendStatus(404);
    }
  })
  .then(() => {
    res.redirect('/patrons');
  })
  .catch(err => {
    res.sendStatus(500);
  });
});


module.exports = router;