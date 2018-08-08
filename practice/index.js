const Koa = require('koa');
const fs = require('fs');
const app = new Koa();
console.log(fs);
function render(page) {
  return new Promise((resolve, reject) => {
    // ES5 是拼接字符串 var pageUrl = './page'+page;
    // 下面是采用ES6 `` 通过$ 插值方式 更加直观
    let pageUrl = `./practice/${page}`;
    // binary  二进制
    fs.readFile(pageUrl, 'utf-8', (err, data) => {
      if(err){
        reject(err);
      }else {
        resolve(data);
      }
    })
  })
}

async function route(url){
  console.log('url: ', url);
  let page = '404.html';
  switch (url){
    case '/':
      page = 'index.html';
      break;
    case '/index':
      page = 'index.html';
      break;
    case '/todo':
      page = 'todo.html';
      break;
    case '/404':
      page = '404.html';
      break;
    default:
      break;
  }
  let html = await render(page);

  return html;
}

app.use(async (ctx) => {
  let url = ctx.request.url;
  let html  = await route(url);

  ctx.body = html;

})

app.listen(3000, () => {
  console.log('http://127.0.0.1:3000');
});