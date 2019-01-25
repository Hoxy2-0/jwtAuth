/*
 * 用户模块
 * 注册、登录
 *
 * @Author: Edwin
 * @Date: 2019-01-25 09:47:11
 * @Last Modified by: Edwin
 * @Last Modified time: 2019-01-25 16:24:26
 */
const router = require('koa-router')();
const jsonwebtoken = require('jsonwebtoken'); // 用于签发、解析`token`
const {
  secret
} = require('../config/config');

const fs = require('fs');
const path = require('path');

// 测试api
router.get('/', async (ctx, next) => {
  return ctx.body = {
    code: 1,
    data: {
      message: 'ok'
    }
  }
})

// 用户注册
router.post('/register', async (ctx, next) => {
  const {
    user,
    password
  } = ctx.request.body;
  if (!user || !password) {
    return ctx.body = {
      code: -1,
      msg: '参数错误',
      data: '用户名和密码不能为空'
    }
  }

  const checkStatus = checkUser(user);
  if (checkStatus) {
    return ctx.body = {
      code: -1,
      msg: '注册失败',
      data: '用户名已存在'
    }
  }

  const { users } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data/user.json')));
  users.push({
    name: user,
    pwd: password,
    id: users.length
  });
  const dataStr = JSON.stringify({
    users
  });
  try {
    await fs.writeFileSync(path.resolve(__dirname, '../../data/user.json'), dataStr);
    return ctx.body = {
      code: 1,
      msg: '注册成功',
    }
  } catch (error) {
    // 返回一个注册失败的JOSN数据给前端
    return ctx.body = {
      code: -1,
      msg: '注册失败',
      data: error
    }
  }
})

// 用户登录
router.post('/login', async (ctx, next) => {
  const {
    user,
    password
  } = ctx.request.body;
  if (!user || !password) {
    return ctx.body = {
      code: 100002,
      msg: '参数错误',
      data: '用户名和密码不能为空'
    }
  }

  if (!checkUser(user)) {
    return ctx.body = {
      code: -1,
      msg: '登录失败',
      data: '用户不存在'
    }
  }
  if (!checkUser(user, password)) {
    return ctx.body = {
      code: -1,
      msg: '登录失败',
      data: '用户名或密码错误'
    }
  }

  return ctx.body = {
    ok: true,
    msg: '登录成功',
    token: getToken({
      user,
      password
    })
  }
})

// 个人信息
router.get('/info', async (ctx, next) => {
  if (!ctx.header || !ctx.header.authorization) {
    ctx.status = 401;
    next();
    return;
  }
  // 前端访问时会附带token在请求头
  const payload = await getJWTPayload(ctx.headers.authorization);
  if (payload) {
    const { user } = payload;
    return ctx.body = {
      code: 1,
      msg: '获取信息成功',
      data: {
        user
      }
    }
  } else {
    ctx.status = 401;
    next();
  }
})

module.exports = router;

/* 获取一个期限为4小时的token */
function getToken(payload = {}) {
  return jsonwebtoken.sign(payload, secret, {
    expiresIn: '2h'
  });
}

/* 通过token获取JWT的payload部分 */
async function getJWTPayload(token) {
  const authArr = token.split(' ');
  if (authArr.length !== 2 || !/^Bearer$/i.test(authArr[0])) {
    return;
  }
  // 验证并解析JWT
  try {
    return await jsonwebtoken.verify(authArr[1], secret);
  } catch (error) {
    console.log(error);
    return;
  }
}

// 检查用户信息
function checkUser(name, pwd = '') {
  const dataStr = fs.readFileSync(path.resolve(__dirname, '../../data/user.json'));
  const {
    users
  } = JSON.parse(dataStr);
  if (users.length === 0) return false;
  return users.some(user => {
    if (name && pwd) {
      return user.name === name && user.pwd === pwd;
    } else if (name) {
      return user.name === name;
    }
    return true;
  })
}
