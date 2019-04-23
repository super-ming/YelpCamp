const express = require('express');
const router = express.Router();
const passport = require('passport');
let User = require('../models/user');
const middleware = require('../middleware');
let Campground = require('../models/campground');
let crypto = require('crypto');

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
      failureRedirect: "/login"
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

router.post('/forgot', (req, res, next) => {
  async.waterfall([
    (done) => {
      // generate user token
      crypto.randomBytes(20, (err, buf) => {
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      // find user by email provided in the forgot password form
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // token expires in 1 hour

        user.save(err => {
          done(err, token, user);
        });
      });
    },
    (token, user, done) => {
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
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      // send email to user email
      smtpTransport.sendMail(mailOptions, (err) => {
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], (err) => {
    if(err){
        req.flash("error", err.message);
    }
    res.redirect('/forgot');
  });
});
module.exports = router;