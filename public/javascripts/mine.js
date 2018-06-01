function afterAuth() {
  let cookie = document.cookie;
  let cryptoId = getCookie(cookie, 'cryptoId');
  if (cryptoId) {
    axios.get('/getUserStatus').then(res => {

      let {
        userInfo
      } = res.data;

      let {
        nickname,
        headimgurl,
        city,
        sex,
        openid,
        bonus_points,
        userid
      } = userInfo;
      console.log('客户端 userinfo', userInfo)
      initPage(nickname, headimgurl, city, sex, bonus_points, userid);
      console.log('openid', openid)
    }).catch(err => {
      console.log('getUserStatus', err)
    })
  }
}

var initPage = function (nickname, headimgurl, city, sex, bonus_points, userid) {
  var app = new Vue({
    el: '#app',
    template: `
      <div>
        <div class="user-info">
          <img class="user-head" :src="headimgurl" alt="用户头像">
          
          <div class="user-id">
            <div class="user-name">{{nickname}}</div>
          </div>

          <div class="info-box">
            <div class="info-item">
              <div class="item-label">游戏ID</div>
              <div class="item-content">{{userid?userid:'未登陆过游戏'}}</div>
            </div>
            <div class="info-item">
              <div class="item-label">用户积分</div>
              <div class="item-content">{{bonus_points}}</div>
            </div>
        </div>
        
        <div class="toggle-btn" @click="toggleList"><span class="btn-text">历史订单</span></div>
            <transition name="fade">
              <div v-if="listShow" class="payed-list">
                <div v-for="item in ordersList" class="list-item">
                    <div class="order-id">订单号：{{item.OrderID}}</div>
                    <div class="order-type">
                      <div>通过{{item.TradeType}}{{item.Remark}}充值</div>
                      <div>到账游戏ID：{{item.UserID}}</div>
                    </div>
                    <div class="order-fee">
                      <div>{{item.GoodType}}</div>
                      <div class="order-amount">金额：{{item.TotalAmount}}</div>
                    </div>
                    <div class="order-time">{{item.OrderTime}}</div>
                </div>
              </div>
            </transition>
        </div>
      </div>
      `,
    data: {
      headimgurl,
      nickname,
      city,
      sex,
      bonus_points,
      userid,
      listShow: false,
      ordersList: []
    },
    beforeMount: async function () {
      console.log('before mount');
      axios.get('/getOrders').then(res => {
        if (res.data.code > 0) {
          this.ordersList = formatOrder(res.data.ordersList)

        } else {
          this.ordersList = []
        }
      })
    },
    methods: {
      toggleList() {
        console.log('toggle')
        console.log('ordersList', this.ordersList)
        this.listShow = !this.listShow;
      }
    }
  })

}

function formatOrder(ordersList) {
  const goodTypes = {
    ghtype1: {
      label: "房卡20赠20",
      goodType: "ghtype1",
      price: 40,
      addition: 40
    },
    ghtype2: {
      label: "房卡40赠40",
      goodType: "ghtype2",
      price: 80,
      addition: 80
    },
    ghtype3: {
      label: "房卡80赠80",
      goodType: "ghtype3",
      price: 160,
      addition: 160
    },
    apptype1: {
      label: "房卡10赠4",
      goodType: "apptype1",
      price: 20,
      addition: 14
    },
    apptype2: {
      label: "房卡20赠10",
      goodType: "apptype2",
      price: 40,
      addition: 30
    },
    apptype3: {
      label: "房卡60赠38",
      goodType: "apptype3",
      price: 120,
      addition: 98
    },
    apptype4: {
      label: "房卡80赠58",
      goodType: "apptype4",
      price: 160,
      addition: 138
    },
    apptype5: {
      label: "房卡120赠88",
      goodType: "apptype5",
      price: 240,
      addition: 208
    },
    apptype6: {
      label: "房卡160赠128",
      goodType: "apptype6",
      price: 320,
      addition: 288
    },
    h5type1: {
      label: "房卡10赠4",
      goodType: "h5type1",
      price: 20,
      addition: 14
    },
    h5type2: {
      label: "房卡20赠10",
      goodType: "h5type2",
      price: 40,
      addition: 30
    },
    h5type3: {
      label: "房卡60赠38",
      goodType: "h5type3",
      price: 120,
      addition: 98
    },
    h5type4: {
      label: "房卡80赠58",
      goodType: "h5type4",
      price: 160,
      addition: 138
    },
    h5type5: {
      label: "房卡120赠88",
      goodType: "h5type5",
      price: 240,
      addition: 208
    },
    h5type6: {
      label: "房卡160赠128",
      goodType: "h5type6",
      price: 320,
      addition: 288
    },
  }

  let tempArr = []
  for (var i = 0; i < ordersList.length; i++) {
    let tempItem = {};
    tempItem.TradeType = ordersList[i].TradeType === 'JSAPI' ? "公众号" : "APP微信";
    tempItem.Remark = ordersList[i].Remark === 'others' ? "给他人" : "给自己";
    tempItem.TotalAmount = ordersList[i].TotalAmount / 100;
    let str = ordersList[i].OrderTime;
    tempItem.OrderTime = `${str.substr(0,4)}-${str.substr(4,2)}-${str.substr(6,2)} ${str.substr(8,2)}:${str.substr(10,2)}`
    tempItem.OrderID = ordersList[i].OrderID;
    tempItem.GoodType = goodTypes[ordersList[i].GoodType].label;
    //项目中期有一次,gameid和userid的转换，导致问题
    tempItem.UserID = ordersList[i].GameID;
    tempArr.unshift(tempItem)
  }
  return tempArr;
}


function testCookies() {
  console.log('test cookies')
  axios.get('/testcookies').then(res => {
    console.log(res)
  })
}


//设置cookie
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}
//获取cookie
function getCookie(cookie, cname) {
  var name = cname + "=";
  var ca = cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
  }
  return "";
}
//清除cookie 
function clearCookie(name) {
  setCookie(name, "", -1);
}