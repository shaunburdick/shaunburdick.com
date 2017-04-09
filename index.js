const Koa = require('koa');
const KoaStatic = require('koa-static');
const Logger = require('koa-logger');

const port = process.env.HTTP_PORT || 5000;

const app = new Koa();
app.use(KoaStatic('./pub'));
app.use(Logger());

app.listen(port);

console.log(`Listening on ${port}...`);