/*
 * 用户模块
 * 注册、登录、退出
 *
 * @Author: Edwin
 * @Date: 2019-01-25 09:47:11
 * @Last Modified by: Edwin
 * @Last Modified time: 2019-01-25 10:29:32
 */
const router = require('koa-router')();

// 测试api
router.get('/', async (ctx, next) => {
  return ctx.body = {
    code: '10001',
    data: {
      message: 'welcome'
    }
  }
})

module.exports = router;