const app = getApp()

Page({
  data: {
    show_auth: app.globalData.show_auth,
    qrCode:'',
    imageUrl: app.globalData.imageUrl
  },

  onLoad: function (option) {
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            show_auth: true
          });
        }else{
          //获取二维码
          that.getQrCode(that);
        }
      }
    })

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
        }
      }
    })
  },

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
   * 分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '天呐，我跟你竟然是天生的情侣脸',
      path: 'pages/compare_face/face',
      imageUrl: '/image/compare_face.jpg',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  },

})