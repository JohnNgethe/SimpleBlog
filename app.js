const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy; // Add Google Strategy
const useragent = require("express-useragent"); // Import express-useragent

require("dotenv").config();

const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(useragent.express());

// Detect if the screen width is less than a certain threshold (e.g., 768px) to determine if it's a mobile device
app.use((req, res, next) => {
  res.locals.isMobile = req.useragent.isMobile;
  next();
});


mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User model
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true, // Ensure emails are unique
  },
  username: {
    type: String,
    unique: true, // Ensure usernames are unique
  },
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

const postSchema = {
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};
const Post = mongoose.model("Post", postSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user with this Google email address exists in your database
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // If the user doesn't exist, create a new user
          user = new User({
            googleId: profile.id,
            // You can save other relevant data from the Google profile here
            // For example, you might want to save the user's name and email
            username: profile.displayName,
            email: profile.emails[0].value,
          });

          // Save the new user to the database
          await user.save();
        } else {
          // If the user exists, update their Google ID (in case it changed)
          user.googleId = profile.id;
          // You can also update other relevant data here
          // For example, you might want to update the user's name
          user.username = profile.displayName;

          // Save the updated user to the database
          await user.save();
        }

        // Return the user to be serialized and stored in the session
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
app.get("/", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const page = parseInt(req.query.page) || 1;
      const postsPerPage = 4; // Number of posts per page
      const skip = (page - 1) * postsPerPage;
      let query = { author: req.user._id };

      // Check if a search query is provided
      if (req.query.search) {
        query.title = new RegExp(_.escapeRegExp(req.query.search), "i"); // Case-insensitive search
      }

      const posts = await Post.find(query)
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(postsPerPage);

      // Calculate total number of pages
      const totalPosts = await Post.countDocuments(query);
      const totalPages = Math.ceil(totalPosts / postsPerPage);

      // Generate an array of page numbers
      const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

      res.render("home", {
        posts: posts,
        currentUser: req.user,
        currentPage: page,
        totalPages: totalPages,
        pageNumbers: pageNumbers, // Pass the page numbers to the template
        search: req.query.search, // Pass the search query back to the template
      });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching posts.");
  }
});

app.get("/about", (req, res) => {
  res.render("about", { aboutCont: aboutContent, currentUser: req.user });
});

app.get("/contact", (req, res) => {
  res.render("contact", { contactCont: contactContent, currentUser: req.user });
});

app.get("/compose", isLoggedIn, (req, res) => {
  res.render("compose", { currentUser: req.user });
});

app.post("/compose", isLoggedIn, (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    author: req.user._id,
  });
  post.save();
  res.redirect("/");
});

app.get("/posts/:postId", async (req, res) => {
  const requestedPostId = req.params.postId;

  try {
    const post = await Post.findOne({ _id: requestedPostId });

    if (post) {
      res.render("post", {
        title: post.title,
        content: post.content,
        post: post,
        currentUser: req.user,
      });
    } else {
      console.log("Post not found");
      res.status(404).send("Post not found.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the post.");
  }
});

app.post("/posts/:postId/delete", isLoggedIn, async (req, res) => {
  const requestedPostId = req.params.postId;

  try {
    // Find the post by ID and delete it
    const deletedPost = await Post.findByIdAndDelete(requestedPostId);

    if (deletedPost) {
      console.log(`Deleted post with ID: ${requestedPostId}`);
      res.redirect("/");
    } else {
      console.log("Post not found");
      res.status(404).send("Post not found.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while deleting the post.");
  }
});

app.get("/posts/:postId/edit", isLoggedIn, async (req, res) => {
  const requestedPostId = req.params.postId;

  try {
    const post = await Post.findOne({ _id: requestedPostId });

    if (post && post.author.equals(req.user._id)) {
      res.render("editpost", {
        post: post,
        currentUser: req.user,
      });
    } else {
      console.log("Post not found or unauthorized");
      res.status(404).send("Post not found or unauthorized.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the post.");
  }
});

app.post("/posts/:postId/edit", isLoggedIn, async (req, res) => {
  const requestedPostId = req.params.postId;

  try {
    const post = await Post.findOne({ _id: requestedPostId });

    if (post && post.author.equals(req.user._id)) {
      post.title = req.body.postTitle;
      post.content = req.body.postBody;
      post.save();
      res.redirect(`/posts/${requestedPostId}`);
    } else {
      console.log("Post not found or unauthorized");
      res.status(404).send("Post not found or unauthorized.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while updating the post.");
  }
});

app.get("/register", (req, res) => {
  res.render("register", { currentUser: req.user });
});

app.post("/register", (req, res) => {
  const { email, username, password } = req.body;
  const newUser = new User({ email, username });

  User.register(newUser, password, (err, user) => {
    if (err) {
      console.error(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/");
      });
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login", { currentUser: req.user });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect to a secure page or handle as needed
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
    }
    res.redirect("/login");
  });
});



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

let port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log("Server started successfully on " + port);
});
