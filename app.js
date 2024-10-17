const express = require("express");
const app = express();
// passport and googleauth libraries
const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc");
// session management
const session = require("express-session");
// dotenv
require("dotenv").config();
// google Strategy setup from passport tutorial
// use session:
app.use(
  session({
    secret: process.env["SESSION_SECRET"],
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate("session"));
// use passport with googleauth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/google",
      scope: ["profile", "email"],
    },
    function verify(issuer, profile, cb) {
      return cb(null, { ...profile, issuer: issuer });
    }
  )
);

// add user session info to requests
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, user);
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

// redirect from google.
app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

app.get("/", (req, res) => {
  console.log(req.user);
  req.user
    ? res.send(`Hello ${req.user.displayName} <a href="/logout">Logout</a>`)
    : res.send(`Hello. Please <a href="/login"> login</a>`);
});

app.get("/authorizedonly", (req, res) => {
  req.user
    ? res.send(`Authorized Only. Hello ${req.user.displayName}`)
    : res.sendStatus(401);
});

app.get("/login/", passport.authenticate("google"));

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.listen(3000, () => {
  console.log("App listening on port 3000");
});
