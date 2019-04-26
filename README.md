## Welcome to Yelpcamp!

This application allows users to share information about their favorite campgrounds.

Public users can browse through campground details. The user needs to be sign up for
an account and be login in order to add campgrounds and write review comments for the campground. Either the author of the original campground submission or an user with admin role can edit or delete the campground entry.  

## How To Run

Clone the files to your local machine. Open a terminal, go to the project directory, and type `install npm` to add the required dependencies.

This application uses a MongoDB database. Please follow these instructions to install MongoDB(https://docs.mongodb.com/v3.2/installation/). 

Follow these instructions to open the Mongo [shell](https://docs.mongodb.com/v3.2/mongo/). 
Once you have the Mongo shell open, make a new database called "yelp_camp" by typing "use yelp_camp" in the shell window. 

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### Dependencies
    * async: ^2.6.2,
    * body-parser: ^1.18.3,
    * connect-flash: ^0.1.1,
    * cookie-parser: ^1.4.4,
    * dotenv: ^7.0.0,
    * ejs: ^2.6.1,
    * express: ^4.16.4,
    * express-session: ^1.15.6,
    * method-override: ^3.0.0,
    * moment: ^2.24.0,
    * mongoose: ^5.4.16,
    * nodemailer: ^6.1.1,
    * passport: ^0.4.0,
    * passport-local: ^1.0.0,
    * passport-local-mongoose": ^5.0.1