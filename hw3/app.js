import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js';
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("blog.db");
db.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    body TEXT
  )
`);

const router = new Router();

router
  .get("/", list)
  .get("/post/new", add)
  .get("/post/:id", show)
  .post("/post", create);

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx) => {
  if (ctx.request.url.pathname.startsWith("/public/")) {
    await send(ctx, ctx.request.url.pathname, {
      root: Deno.cwd(),
    });
  }
});

function query(sql, params = []) {
  const list = [];
  for (const [id, title, body] of db.query(sql, params)) {
    list.push({ id, title, body });
  }
  return list;
}

async function list(ctx) {
  const posts = query("SELECT id, title, body FROM posts");
  ctx.response.body = render.list(posts);
}

async function add(ctx) {
  ctx.response.body = render.newPost();
}

async function show(ctx) {
  const pid = ctx.params.id;
  const posts = query("SELECT id, title, body FROM posts WHERE id = ?", [pid]);
  const post = posts[0];
  if (!post) {
    ctx.throw(404, "Post not found");
  }
  ctx.response.body = render.show(post);
}

async function create(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    const pairs = await body.value;
    const post = {};
    for (const [key, value] of pairs) {
      post[key] = value;
    }
    db.query("INSERT INTO posts (title, body) VALUES (?, ?)", [post.title, post.body]);
    ctx.response.redirect("/");
  }
}

console.log("Server running at http://127.0.0.1:8000");
await app.listen({ port: 8000 });
