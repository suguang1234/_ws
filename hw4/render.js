export function layout(title, content) {
  return `
  <html>
  <head>
    <title>${title}</title>
    <style>
      body {
        padding: 80px;
        font: 16px Helvetica, Arial;
      }
      h1 {
        font-size: 2em;
      }
      h2 {
        font-size: 1.2em;
      }
      #posts {
        margin: 0;
        padding: 0;
      }
      #posts li {
        margin: 40px 0;
        padding: 0;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
        list-style: none;
      }
      #posts li:last-child {
        border-bottom: none;
      }
      textarea {
        width: 100%;
        height: 200px;
      }
      input[type=text], input[type=password], textarea {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        font-size: 1em;
        width: 100%;
        box-sizing: border-box;
      }
      input[type=submit] {
        background-color: #007BFF;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 20px;
        font-size: 1em;
        cursor: pointer;
      }
      input[type=submit]:hover {
        background-color: #0056b3;
      }
    </style>
  </head>
  <body>
    <section id="content">
      ${content}
    </section>
  </body>
  </html>
  `;
}

export function loginUi() {
  return layout('Login', `
    <h1>Login</h1>
    <form action="/login" method="post">
      <p><input type="text" placeholder="Username" name="username"></p>
      <p><input type="password" placeholder="Password" name="password"></p>
      <p><input type="submit" value="Login"></p>
      <p>New user? <a href="/signup">Create an account</a></p>
    </form>
  `);
}

export function signupUi() {
  return layout('Signup', `
    <h1>Signup</h1>
    <form action="/signup" method="post">
      <p><input type="text" placeholder="Username" name="username"></p>
      <p><input type="password" placeholder="Password" name="password"></p>
      <p><input type="text" placeholder="Email" name="email"></p>
      <p><input type="submit" value="Signup"></p>
    </form>
  `);
}

export function success() {
  return layout('Success', `
    <h1>Success!</h1>
    <p>You may <a href="/">read all posts</a> or <a href="/login">log in</a> again!</p>
  `);
}

export function fail() {
  return layout('Fail', `
    <h1>Fail!</h1>
    <p>You may <a href="/">read all posts</a> or <a href="javascript:window.history.back()">go back</a>.</p>
  `);
}

export function list(posts, user) {
  let list = posts.map(post => `
    <li>
      <h2>${post.title} - by ${post.username}</h2>
      <p><a href="/post/${post.id}">Read post</a></p>
    </li>
  `).join('\n');
  let content = `
    <h1>Posts</h1>
    <p>${user ? `Welcome ${user.username}, <a href="/post/new">Create a Post</a> or <a href="/logout">Logout</a>` : '<a href="/login">Login</a> to Create a Post!'}</p>
    <p>There are <strong>${posts.length}</strong> posts!</p>
    <ul id="posts">${list}</ul>
  `;
  return layout('Posts', content);
}

export function newPost() {
  return layout('New Post', `
    <h1>New Post</h1>
    <form action="/post" method="post">
      <p><input type="text" placeholder="Title" name="title"></p>
      <p><textarea placeholder="Contents" name="body"></textarea></p>
      <p><input type="submit" value="Create"></p>
    </form>
  `);
}

export function show(post) {
  return layout(post.title, `
    <h1>${post.title} - by ${post.username}</h1>
    <p>${post.body}</p>
  `);
}
