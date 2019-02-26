const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//const request = require('request');

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

let campgrounds = [
    {name: "Sand Point", image: "https://www.photosforclass.com/download/flickr-8798412683"},
    {name: "Cape Alava", image: "https://www.photosforclass.com/download/flickr-5165710222"},
    {name: "Colchuck Lake", image: "https://farm3.staticflickr.com/2862/10350491664_6d0e84d55a.jpg"}
];

app.get("/", (req, res)=> {
    res.render("landing");
});

app.get("/campgrounds", (req, res)=> {
    res.render("campgrounds", {campgrounds: campgrounds});
})

app.post("/campgrounds", (req, res)=> {
    console.log(req.body);
    let name = req.body.name;
    let image= req.body.image;
    let newCampground = {name: name, image: image};
    campgrounds.push(newCampground);
    res.redirect("/campgrounds");
});

app.get("/campgrounds/new", (req,res)=> {
    res.render("new.ejs");
})

//process.env.PORT, process.env.IP
app.listen("3000", ()=>{
    console.log("YelpCamp Server started!");
})
