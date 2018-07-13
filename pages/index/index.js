const app = getApp()

Page({
  data: {
    show_auth: app.globalData.show_auth,
    qrCode:'',
    imageUrl: app.globalData.imageUrl,
    statistic:'',
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    steps:[]
  },

  onLoad: function (option) {
    let _this = this;
    this.showAuth();
    this.statistic();
    this.steps(_this);
  },

  /**
   * 判断是否应该显示授权按钮
   */
  showAuth:function(){
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            show_auth: true
          });
        } else {
          //获取二维码
          that.getQrCode(that);
          that.postRunData();
        }
      }
    })
  },

  /**
   * 登录获取微信步数
   */
  loginForRunData:function(){
    let that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.werun']) {
          wx.login({
            success: res => {
              // 发送 res.code 到后台换取 openId, sessionKey, unionId
              console.log("res.code:" + res.code);
              let code = res.code;
              wx.getWeRunData({
                success(res) {
                  const encryptedData = res.encryptedData;
                  const iv = res.iv;
                  console.log("步数数据：" + encryptedData);
                  that.postRunData(encryptedData, iv, code);
                }
              })
            }
          })
        } else {
          console.log('无权获得微信步数');
        }
      }
    })
  },

  /**
   * 收集用户步数
   */
  postRunData: function (encryptedData,iv,code){
    app.http('post', `/run_data`,
      {
        encrypted_data: encryptedData,
        iv: iv,
        code: code
      }, res => {
        
        console.log(res);

      });
  },

  /**
   * 监听用户点击授权按钮
   */
  getAuthUserInfo: function (data) {
    app.globalData.show_auth = false;
    this.setData({
      show_auth: false
    });

    let _this = this;
    app.login(null, null, null, function () {
      console.log('登录中');
      //获取二维码
      _this.getQrCode(_this);
      wx.authorize({ scope: "scope.werun" })
      wx.authorize({ scope: "scope.userLocation" })
    });
  },

  /** 
   * 小程序的二维码
   */
  getQrCode: function (_this) {
    app.http('GET', '/qr_code', {}, function (res) {
      console.log(res.data.data.qr_code);
      _this.setData({
        qrCode: res.data.data.qr_code
      })
    });
  },

  /**
   * 获取统计的数据
   */
  statistic:function(){
    let _this = this;
    app.http('GET', '/run_statistic', {}, function (res) {
      _this.setData({ statistic:res.data.data})
    });
  },

  /**
   * 获取步数列表
   */
  steps: function (_this) {
    let order_by = 'run_at';
    let sort_by = 'desc';
    app.http(
      'GET',
       `/run_steps?page_size=${_this.data.pageSize}&page_number=${_this.data.pageNumber}&order_by=${order_by}&sort_by=${sort_by}
       `,
        {}, 
        function (res) {
          console.log(res.data.data);
          if(res.data.error_code == 0){
            let steps = _this.data.steps;
            let stepData = res.data.data.page_data;
            for (let step in stepData){
              steps.push(stepData[step]);
            }
            _this.setData({
              steps:steps,
              pageNumber: _this.data.pageNumber + 1 
            })
          }
    });
  },
  /**
 * 上拉加载更多
 */
  onReachBottom: function () {
    let _this = this;
    this.steps(_this);
  },

  /**
   * 分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '说走就走，让步数代你去旅行吧',
      path: 'pages/index/index',
      imageUrl: '/image/compare_face.jpg',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  },

})