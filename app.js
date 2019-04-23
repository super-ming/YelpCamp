const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Comment = require('./models/comment');
const User = require('./models/user');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const seedDB = require('./seeds');
const session = require("express-session");
cookieParser = require("cookie-parser");

// configure dotenv
require('dotenv').config();

// Routes
const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const indexRoutes = require('./routes/index');

mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}))  ;

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
//seedDB(); // seed the database

app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
app.use(flash());

//require moment
app.locals.moment = require('moment');

/*
Colchuck Lake,
image: "https://farm3.staticflickr.com/2862/10350491664_6d0e84d55a.jpg"
sand point
image: "https://www.photosforclass.com/download/flickr-8798412683"
Cape alava
image: "https://www.photosforclass.com/download/flickr-5165710222"
*/

// Passport configuration
app.use(require('express-session')({
    secret: 'Hello world!',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to pass current user data to all views
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments/', commentRoutes);

//process.env.PORT, process.env.IP
app.listen(process.env.PORT || 3000, ()=>{
    console.log("YelpCamp Server started!");
});
