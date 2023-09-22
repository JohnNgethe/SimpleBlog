const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
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

mongoose.connect(process.env.DB_URI,{
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
};
const Post = mongoose.model("Post", postSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const posts = await Post.find({ author: req.user._id });
      res.render("home", {
        posts: posts,
        currentUser: req.user,
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
      res.render("edit", {
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
