const router = require('koa-router')()

const checkSig = require('../middlewares/checkSig')

const indexControl = require('../controllers/index')

const {
  appid
} = require('../danger.config')

router.get('/', checkSig, indexControl.pureGet)

router.post('/', checkSig, indexControl.purePost)

router.get('/getUserStatus', indexControl.getUserStatus)

router.get('/getOrders', indexControl.getOrders)

router.post('/postCode', indexControl.postCode)

router.post('/getSig', indexControl.getSig)

const {
  aesDecrypt,
  aesEncrypt
} = require('../crypto')

const {
  checkPayment
} = require('../services/index')

router.get('/testcookies', async (ctx, next) => {
  let cryptoId = ctx.cookies.get('cryptoId');
  let openId = aesDecrypt(cryptoId);
  ctx.body = {
    openId
  }
})


const {
  payLog
} = require('../utils/logger')


//准备把支付成功的回调地址迁移
router.post('/receivePayInfo', async ctx => {
  let xml = ctx.request.body.xml;
  const {
    transaction_id
  } = xml;
  let checkRes = await checkPayment(transaction_id);
  payLog.info('check payment res', checkRes);
  ctx.body = `<xml>
                <return_code><![CDATA[SUCCESS]]></return_code>
                <return_msg><![CDATA[OK]]></return_msg>
              </xml>`;
})


router.post('/requestPayment', indexControl.requestPayment)


router.all('/oauthpage', ctx => {
  if (ctx.query.aimpage === void 0) {
    return;
  }
  let aimpage = ctx.query.aimpage;
  ctx.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${aimpage}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`);
  ctx.status = 302;
});


router.get('/index', async (ctx, next) => {
  await ctx.render('index', {
    title: "测试主页"
  })
})

//--弃用---------------------------
// router.get('/oauthpage', async (ctx, next) => {
//   await ctx.render('oauthpage', {
//     title: "授权页面"
//   })
// })

router.get('/guide', async (ctx, next) => {
  await ctx.render('guide', {
    title: "统一导航页面"
  })
})


router.get('/pay', async (ctx, next) => {
  await ctx.render('pay', {
    title: "嘻游游戏充值"
  })
})


router.get('/download', async (ctx, next) => {
  await ctx.render('download', {
    title: "嘻游游戏下载"
  })
})

router.get('/mine', async (ctx, next) => {
  await ctx.render('mine', {
    title: "个人中心"
  })
})
router.get('/paygreat', async (ctx, next) => {
  await ctx.render('paygreat', {
    title: "支付成功"
  })
})

router.get('/sharepage', async (ctx, next) => {
  await ctx.render('sharepage', {
    title: "分享中转页"
  })
})

router.get('/luckwheel', async (ctx, next) => {
  await ctx.render('luckwheel', {
    title: "幸运大转盘"
  })
})

const {
  generateLotto,
  addBonus,
  checkBonus,
  minusBonus
} = require('../services/luckwheel')

router.get('/lottowheel', async (ctx, next) => {
  let cryptoId = ctx.cookies.get('cryptoId');
  let openId = aesDecrypt(cryptoId);

  if (await checkBonus(openId)) {
    await minusBonus(openId,5)
    var lotto_result = generateLotto();
    ctx.body = {
      code: 1,
      lotto_result
    }
  }else {
    ctx.body = {
      code: -1,
      message:"积分不够"
    }
  }
  
  
})

const {
  setButtons
} = require('../utils/setGHbuttons')

router.get('/setGHbuttons', async (ctx, next) => {
  if (ctx.query.adminSecret === void 0) {
    return;
  }
  const {
    adminSecret
  } = ctx.query;
  console.log('---------------------有人尝试更改公众号按钮------------------------');
  if (adminSecret === "buttonMiMa") {
    console.log('---------------------更改公众号按钮成功------------------------');
    await setButtons();
    ctx.body = '配置按钮成功'
  } else {
    console.log('---------------------更改公众号按钮失败------------------------');
    ctx.body = "鉴权失败"
  }
})



module.exports = router