const express = require('express');
const router = express.Router();
const passport = require('passport');
const middleware = require('../middleware');
const crypto = require('crypto');
const async = require("async");
const nodemailer = require("nodemailer");
const Campground = require('../models/campground');
const User = require('../models/user');

router.get("/", (req, res)=> {
    res.render("landing");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    let newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });

    if(req.body.adminCode === 'Hello world!') {
      newUser.isAdmin = true;
    }

    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, ()=> {
            req.flash("success", "Welcome to Yelpcamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("local",
    { successRedirect: "/campgrounds",
      failureRedirect: "/login",
      failureFlash: true,
      successFlash: 'Welcome to Yelpcamp!'
    }), (req, res) => {
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "You're logged out!");
    res.redirect("/campgrounds");
});

// forgot password
router.get('/forgot', (req, res) => {
  res.render('forgot');
});

router.post('/forgot', async (req, res, next) => {
  const generateToken = ({ stringBase = 'hex', byteLength = 20 } = {}) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(byteLength, (err, buf) => {
        if(err){
            req.flash("error", err.message);
            reject(err.message)
            return res.render("register");
        }
        resolve(buf.toString(stringBase));
      });
    });
  };

  const findUser = token => {
    return new Promise((resolve, reject) => {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }
  
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // token expires in 1 hour
        user.save(err => {
          resolve(user);
        });
      });
    })
  };

  const sendEmail = (token, user) => {
    return new Promise((resolve, reject) => {
      // create email object with reset link and user token
      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'hkboi108@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      let mailOptions = {
        to: user.email,
        from: 'hkboi108@gmail.com',
        subject: 'Yelpcamp Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      // send email to user email
      smtpTransport.sendMail(mailOptions, (err) => {
        resolve(req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.'),
        res.redirect('/forgot'));
        if (err) {
          reject(err);
        }
      });
      resolve(user);
    })
  }

  try {
    const newToken = await generateToken();
    const user = await findUser(newToken);
    const email = await sendEmail(newToken, user);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect('/forgot');
  }
});

// user clicks on forgot password email link
router.get('/reset/:token', (req, res) => {
  // search for user using provided user token from email
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    // if user is found, show reset password view
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', async (req, res) => {

  const resetPassword = () => {
    return new Promise((resolve, reject) => {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if (req.body.password === req.body.confirm) {
          // Mongoose setPassword method that sets and encrypts the password
          user.setPassword(req.body.password, (err) => {
            // invalidate user token and expiration date
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            // save new user info and log in
            user.save(err => {
              if(err){
                  req.flash("error", err.message);
                  return res.render("register");
              }
              req.logIn(user, err => {
                if(err){
                    req.flash("error", err.message);
                    return res.render("register");
                }
              });
              resolve(user);
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    })
  }

  const sendEmail = user => {
    return new Promise((resolve, reject) => {
      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'hkboi108@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      let mailOptions = {
        to: user.email,
        from: 'hkboi108@gmail.com',
        subject: 'Your Yelpcamp password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, (err) => {
        req.flash('success', 'Success! Your password has been changed.');
        res.redirect('/campgrounds');
      });
      resolve(user);
    })
  }

  try {
    const user = await resetPassword();
    const email = await sendEmail(user);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect('reset');
  }
});

// USER PROFILE
// find user by id
router.get("/users/:id", (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if(err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/");
    }
    // find campgrounds with user id
    Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds) => {
      if(err) {
        req.flash("error", "Something went wrong.");
        res.redirect("/");
      }
      res.render("users/profile", {user: foundUser, campgrounds: campgrounds});
    })
  });
});

module.exports = router;
