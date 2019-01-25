const path = require('path'); // 用于处理目录路径
const Koa = require('koa'); // web开发框架
const serve = require('koa-static'); // 静态资源处理
const Router = require('koa-router'); // 路由中间件
const jwt = require('koa-jwt'); // 用于路由权限控制
const koaBody = require('koa-body'); // 用于查询字符串解析到`ctx.request.query`

// const errorHandle = require('./middlewares/errorHandle');
const home = require('./routes/home');
const api = require('./routes/api');

const { secret } = require('./config/config');
const app = new Koa();
const router = new Router(); // 路由
router.use('/', home.routes(), home.allowedMethods());
router.use('/api', api.routes(), api.allowedMethods());

const website = {
  scheme: 'http',
  host: 'localhost',
  port: 1337,
  join() {
    return `${this.scheme}://${this.host}:${this.port}`
  }
}

// jwt配置
const jwtConfig = jwt({
  secret
}).unless({
  path: [
    /^\/api\/login/,
    /^\/api\/register/,
    /^\/api(\/)?/,
  ]
})

app.use(serve(path.join(__dirname, './public'))) // 静态资源处理
  .use(koaBody()) // 查询字符串解析到`ctx.request.query`
  .use(router.routes()).use(router.allowedMethods()) /* 路由权限控制 */
  .use(jwtConfig) // 当token处理

// 监听服务器端口
app.listen(website.port, () => {
  console.log(`${website.join()} 服务器已经启动！`);
});
