import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use((ctx) => {
  // ctx.response.status = 404
  console.log('url=', ctx.request.url)
  let pathname = ctx.request.url.pathname
  if (pathname == '/') {
    ctx.response.body = `<html>   
<body>
<h1>我的自我介紹</h1>
<ol>
<li><a href="/name">姓名</a></li>
<li><a href="/tall">身高</a></li>
<li><a href="/sex">性別</a></li>
<li><a href="https://youtu.be/dQw4w9WgXcQ?si=p2qDkLsgiQykyAPx">?</a></li>
</ol>
</body>
<style>
body {
  background-color: lightblue;
}
</style> 
</html>
`
  } else if (pathname == '/name') {
    ctx.response.body = '陳冠昀'
  } else if (pathname == '/tall') {
    ctx.response.body = '180'
    }
    else if (pathname == '/sex') {
    ctx.response.body = '男'
    }
  else {ctx.response.body = 'Not Found!'
  }
  });

console.log('start at : http://127.0.0.1:8000')
await app.listen({ port: 8000 })
