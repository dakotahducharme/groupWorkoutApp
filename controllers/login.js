const express = require('express');
const router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcryptjs');

router.post('/registration', async (req, res) => {

  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  const userDbEntry = {};

  userDbEntry.username = req.body.username;
  userDbEntry.email = req.body.email;
  userDbEntry.password = hashedPassword;

  try {
    const createdUser = await User.create(userDbEntry);
    console.log(`created user ${createdUser}`)
    req.session.userId = createdUser._id;
    req.session.email = createdUser.email;
    req.session.username = createdUser.username;
    req.session.logged = true;

    res.redirect('/users');
  } catch (err) {
    res.send(err);
  }
})

router.post('/login', async (req, res) => {
  try {
    const foundUser = await User.findOne({
      email: req.body.email
    })
    if (foundUser) {

      if (bcrypt.compareSync(req.body.password, foundUser.password)) {
        req.session.message = '';
        req.session.userId = foundUser._id;
        req.session.email = foundUser.email;
        req.session.username = foundUser.username;
        req.session.logged = true;
        console.log(req.session, req.body)

        res.redirect('/users')
      } else {
        req.session.message = 'Username or password are incorrect';
        res.redirect('/')
      }
    } else {
      req.session.message = 'Username or password are incorrect';
      res.redirect('/')
    }
  } catch (err) {
    res.send(err);
  };
});


router.get('/logout', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      res.send(err);
    } else {
      res.redirect('/');
    }
  });
});


module.exports = router;
