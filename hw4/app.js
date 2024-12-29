import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from "./render.js";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, title TEXT, body TEXT)");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT)");

const router = new Router();

router
  .get("/", list)
  .get("/signup", signupUi)
  .post("/signup", signup)
  .get("/login", loginUi)
  .post("/login", login)
  .get("/logout", logout)
  .get("/post/new", add)
  .get("/post/:id", show)
  .post("/post", create)
  .get("/list/:user", listUserPosts);

const app = new Application();
app.use(Session.initMiddleware());
app.use(router.routes());
app.use(router.allowedMethods());

function sqlcmd(sql, args) {
  console.log("sql:", sql);
  try {
    const results = db.query(sql, args);
    console.log("sqlcmd: results=", results);
    return results;
  } catch (error) {
    console.log("sqlcmd error: ", error);
    throw error;
  }
}

function postQuery(sql, args = []) {
  const list = [];
  for (const [id, username, title, body] of sqlcmd(sql, args)) {
    list.push({ id, username, title, body });
  }
  console.log("postQuery: list=", list);
  return list;
}

function userQuery(sql, args = []) {
  const list = [];
  for (const [id, username, password, email] of sqlcmd(sql, args)) {
    list.push({ id, username, password, email });
  }
  console.log("userQuery: list=", list);
  return list;
}

async function parseFormBody(body) {
  const pairs = await body.formData();
  const obj = {};
  for (const [key, value] of pairs.entries()) {
    obj[key] = value;
  }
  return obj;
}

async function signupUi(ctx) {
  ctx.response.body = render.signupUi();
}

async function signup(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    const user = await parseFormBody(body);
    const dbUsers = userQuery(
      "SELECT id, username, password, email FROM users WHERE username = ?",
      [user.username]
    );
    if (dbUsers.length === 0) {
      sqlcmd("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [
        user.username,
        user.password,
        user.email,
      ]);
      ctx.response.body = render.success();
    } else {
      ctx.response.body = render.fail();
    }
  }
}

async function loginUi(ctx) {
  ctx.response.body = render.loginUi();
}

async function login(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    const user = await parseFormBody(body);
    const dbUsers = userQuery(
      "SELECT id, username, password, email FROM users WHERE username = ?",
      [user.username]
    );
    const dbUser = dbUsers[0];
    if (dbUser && dbUser.password === user.password) {
      await ctx.state.session.set("user", dbUser);
      ctx.response.redirect("/");
    } else {
      ctx.response.body = render.fail();
    }
  }
}

async function logout(ctx) {
  await ctx.state.session.set("user", null);
  ctx.response.redirect("/");
}

async function list(ctx) {
  const posts = postQuery("SELECT id, username, title, body FROM posts");
  const user = await ctx.state.session.get("user");
  ctx.response.body = render.list(posts, user);
}

async function add(ctx) {
  const user = await ctx.state.session.get("user");
  if (user) {
    ctx.response.body = render.newPost();
  } else {
    ctx.response.body = render.fail();
  }
}

async function show(ctx) {
  const pid = ctx.params.id;
  const posts = postQuery("SELECT id, username, title, body FROM posts WHERE id = ?", [pid]);
  const post = posts[0];
  if (!post) ctx.throw(404, "Invalid post ID");
  ctx.response.body = render.show(post);
}

async function create(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    const post = await parseFormBody(body);
    const user = await ctx.state.session.get("user");
    if (user) {
      sqlcmd("INSERT INTO posts (username, title, body) VALUES (?, ?, ?)", [
        user.username,
        post.title,
        post.body,
      ]);
      ctx.response.redirect("/");
    } else {
      ctx.throw(403, "Not logged in");
    }
  }
}

async function listUserPosts(ctx) {
  const username = ctx.params.user;
  const posts = postQuery(
    "SELECT id, username, title, body FROM posts WHERE username = ?",
    [username]
  );
  const user = await ctx.state.session.get("user");
  ctx.response.body = render.list(posts, user);
}

console.log("Server run at http://127.0.0.1:8000");
await app.listen({ port: 8000 });
