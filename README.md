
```markdown
# SimpleBlog Project README

Welcome to the README  of SimpleBlog project. In this document, we'll explore the routes defined in app.js file and explain how they work.

## Table of Contents
- [Routes Overview](#routes-overview)
  - [Express Setup](#express-setup)
  - [User Authentication](#user-authentication)
  - [Homepage](#homepage)
  - [Public Posts](#public-posts)
  - [About and Contact](#about-and-contact)
  - [Compose New Post](#compose-new-post)
  - [Viewing and Editing Posts](#viewing-and-editing-posts)
  - [User Registration and Login](#user-registration-and-login)
  - [Google OAuth Authentication](#google-oauth-authentication)
  - [Logging Out](#logging-out)
- [Pagination](#pagination)

---

## Routes Overview

### Express Setup
```javascript
// Express and Middleware Setup
// ...
```

Explanation: This section sets up your Express.js application, including configuring middleware like body-parser, session management, and user-agent detection.

### User Authentication
```javascript
// User Authentication Setup
// ...
```

Explanation: Here, you configure user authentication using Passport.js and LocalStrategy. It also includes the Google OAuth 2.0 strategy for external authentication.

### Homepage
```javascript
// Homepage Route
app.get("/", async (req, res) => {
  // ...
});
```

Explanation: This route handles the homepage, displaying user-specific posts. It includes pagination for displaying multiple posts and a search functionality.

### Public Posts
```javascript
// Public Posts Route
app.get("/public", async (req, res) => {
  // ...
});
```

Explanation: This route displays public posts, similar to the homepage. It also includes pagination and search functionality for public posts.

### About and Contact
```javascript
// About and Contact Routes
app.get("/about", (req, res) => {
  // ...
});

app.get("/contact", (req, res) => {
  // ...
});
```

Explanation: These routes handle the "About" and "Contact" pages. They simply render static content.

### Compose New Post
```javascript
// Compose New Post Routes
app.get("/compose", isLoggedIn, (req, res) => {
  // ...
});

app.post("/compose", isLoggedIn, async (req, res) => {
  // ...
});
```

Explanation: These routes allow users to compose and submit new blog posts. Authentication is required (`isLoggedIn` middleware).

### Viewing and Editing Posts
```javascript
// Viewing and Editing Posts Routes
app.get("/posts/:postId", async (req, res) => {
  // ...
});

app.post("/posts/:postId/delete", isLoggedIn, async (req, res) => {
  // ...
});

app.get("/posts/:postId/edit", isLoggedIn, async (req, res) => {
  // ...
});

app.post("/posts/:postId/edit", isLoggedIn, async (req, res) => {
  // ...
});
```

Explanation: These routes handle the viewing, deleting, and editing of individual posts. Authentication is required for certain actions.

### User Registration and Login
```javascript
// User Registration and Login Routes
app.get("/register", (req, res) => {
  // ...
});

app.post("/register", (req, res) => {
  // ...
});

app.get("/login", (req, res) => {
  // ...
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
}), (req, res) => {});
```

Explanation: These routes handle user registration and login using Passport.js.

### Google OAuth Authentication
```javascript
// Google OAuth Authentication Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  // Successful authentication, redirect to a secure page or handle as needed
  res.redirect("/");
});
```

Explanation: These routes handle Google OAuth authentication. Users can log in or register using their Google accounts.

### Logging Out
```javascript
// Logout Route
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    // ...
  });
});
```

Explanation: This route allows users to log out of their accounts.

Here's an explanation of how pagination works in the provided code:

```html
<!-- Pagination -->
<div class="pagination">
  <% if (currentPage > 1) { %>
    <a href="/?page=<%= currentPage - 1 %>&<%= search ? 'search=' + search : '' %>">Previous</a>
  <% } %>
  
  <% pageNumbers.forEach((pageNumber) => { %>
    <a href="/?page=<%= pageNumber %>&<%= search ? 'search=' + search : '' %>" class="<%= currentPage === pageNumber ? 'active' : '' %>">
      <%= pageNumber %>
    </a>
  <% }); %>

  <% if (currentPage < totalPages) { %>
    <a href="/?page=<%= currentPage + 1 %>&<%= search ? 'search=' + search : '' %>">Next</a>
  <% } %>
</div>
```

In this HTML markup, pagination is implemented for displaying a list of posts, with options to navigate between pages. Let's break down how it works:

1. `<div class="pagination">`: This div element contains the pagination links.

2. Previous Page Link:
   - `<% if (currentPage > 1) { %>`: This conditional statement checks if the current page is greater than 1 (not the first page).
   - `<a href="/?page=<%= currentPage - 1 %>&<%= search ? 'search=' + search : '' %>">Previous</a>`: If the current page is not the first page, it provides a link to the previous page. It includes the `currentPage - 1` as the page number in the URL.

3. Page Number Links:
   - `<% pageNumbers.forEach((pageNumber) => { %>`: This loop iterates through the available page numbers.
   - `<a href="/?page=<%= pageNumber %>&<%= search ? 'search=' + search : '' %>" class="<%= currentPage === pageNumber ? 'active' : '' %>">`: It generates a link for each page number, and if the current page matches the looped page number, it adds the 'active' class to highlight the current page.

4. Next Page Link:
   - `<% if (currentPage < totalPages) { %>`: This conditional statement checks if the current page is less than the total number of pages (not the last page).
   - `<a href="/?page=<%= currentPage + 1 %>&<%= search ? 'search=' + search : '' %>">Next</a>`: If the current page is not the last page, it provides a link to the next page. It includes `currentPage + 1` as the page number in the URL.

This pagination logic allows users to navigate through the pages of posts, with "Previous" and "Next" links, as well as clickable page numbers to jump directly to a specific page. The `currentPage` variable represents the current page being displayed, and `totalPages` represents the total number of pages available based on the number of posts and posts per page.```

Explanation: This section provides an explanation of how pagination is implemented in your project's front-end using HTML and dynamically generated links for navigating through pages of posts.

---

This README provides an overview of the routes and functionality of the project. For detailed code explanations, please refer to your app.js file and associated view templates.

# Resources

In this section, we'll list the key resources and technologies used in the development of our Blog project. We'll provide both Markdown elements and HTML markup for a visually pleasing presentation.

## Technologies Used

- **Node.js**: Our server-side runtime environment.
- **Express.js**: A web application framework for Node.js.
- **MongoDB**: A NoSQL database used to store blog posts and user data.
- **Passport.js**: An authentication middleware for Node.js.
- **EJS**: A template engine for rendering dynamic HTML content.
- **HTML5 & CSS3**: For structuring and styling our web pages.
- **Bootstrap**: A front-end framework for responsive design.

## NPM Packages

We used various NPM packages to enhance the functionality of our project:

- **express**: To create and manage our web server.
- **mongoose**: For MongoDB database interaction.
- **passport**: For user authentication.
- **express-useragent**: To detect and handle user-agent information.
- **dotenv**: For environment variable management.
- **passport-local**: Passport strategy for local authentication.
- **passport-local-mongoose**: Mongoose plugin for Passport local strategy.
- **passport-google-oauth20**: Passport strategy for Google OAuth 2.0.

## External APIs

- **Google OAuth 2.0**: Used for Google account authentication.

## Front-End Libraries

- **Font Awesome**: For icons.
- **Google Fonts**: For typography.

## Additional Tools

- **Visual Studio Code**: Our preferred code editor.
- **GitHub**: For version control and collaboration.
- **Render**: For deploying our web application.
- **MongoAtlas**: For hosting our cloud DB.

## Project Structure
- **Render**: For deploying our web application.- **Render**: For deploying our web application.


Our project follows a structured directory layout, with key folders including:

- **public**: Contains static assets like stylesheets and client-side JavaScript.
- **views**: Stores EJS templates for rendering dynamic content.
- **models**: Defines Mongoose schemas for our data models.
- **routes**: Contains Express route handlers.
- **partials**: Reusable HTML components included in templates.
- **config**: Configuration files for Passport and environment variables.

## Getting Started

To get started with the project locally, follow these steps:

1. Clone this repository to your local machine.
2. Install Node.js and npm if not already installed.
3. Run `npm install` to install project dependencies.
4. Set up a MongoDB database and provide the connection URI in the `.env` file.
5. Configure Google OAuth credentials if using OAuth authentication.
6. Run the application using `npm start` or `node app.js`.

Feel free to explore the project's source code and make any contributions or improvements.

---

For more detailed information and setup instructions, please refer to the project's documentation and source code.
```