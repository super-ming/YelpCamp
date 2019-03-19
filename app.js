const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//const request = require('request');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Comment = require('./models/comment');
const User = require('./models/user');
const methodOverride = require('method-override');
const seedDB = require('./seeds');

//Routes
const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const indexRoutes = require('./routes/index');


mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

app.use(methodOverride('_method'));

/*
Colchuck Lake,
image: "https://farm3.staticflickr.com/2862/10350491664_6d0e84d55a.jpg"
*/

//sand point
//https://www.photosforclass.com/download/flickr-8798412683


//Cape alava
//https://www.photosforclass.com/download/flickr-5165710222

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
    next();
});

app.use(indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments/', commentRoutes);

//process.env.PORT, process.env.IP
app.listen("3000", ()=>{
    console.log("YelpCamp Server started!");
});
