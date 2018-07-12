const qiniuUploader = require("../../utils/qiniuUploader");
const uploader = require("../../utils/uploadImage");

const app = getApp()

Page({
  data: {
    showSelect:false,
    showBegin:true,
    showCancel:false,
    showReport: false,
    bindReport:false,
    showSubmit:false,
    tryAgant:false,
    imageLeft:'',
    imageRight:'',
    postImageLeft:'',
    PostImageRight:'',
    rate:0,
    face:'',
    conclusion:'',
    show_auth: app.globalData.show_auth,
    qrCode:'',
    imageUrl: app.globalData.imageUrl
  },

  onLoad: function (option) {
    this.hiddenSelect();
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            show_auth: true
          });
        }else{
          //设置七牛上传token
          app.getUploadToken(token => {
            that.setData({
              uploadToken: token
            });
          });
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
      //设置七牛上传token
      app.getUploadToken(token => {
        _this.setData({
          uploadToken: token
        });
      });
      //获取二维码
      _this.getQrCode(_this);
      wx.authorize({ scope: "scope.werun" })
      wx.authorize({ scope: "scope.userLocation" })
    });
  },

  /**
   * 显示
   */
  showSelect:function(){
    this.setData({
      showSelect: true,
      showBegin: false,
      showCancel: true
    });
  },

  /**
   * 隐藏
   */
  hiddenSelect:function(){
    this.setData({
      showSelect: false,
      showReport: false,
      bindReport: false
    });
  },

  /**
   * 取消选择
   */
  cancelSelect:function(){
    this.setData({
      showSelect: false,
      showBegin: true,
      showCancel: false,
      bindReport: false
    });
  },

  /**
   * 选择左图
   */
  selectLeft:function(){

    this.setData({ showReport: false })
    let _this = this;
    wx.chooseImage({
      count: 1, 
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        console.log('图片：' + res.tempFilePaths);
        var tempFilePaths = res.tempFilePaths;
        _this.setData({
          imageLeft: tempFilePaths[0]
        });
        wx.showLoading({
          title: '加载中',
        });

        uploader.upload(tempFilePaths[0], key => {
          wx.hideLoading();
          console.log(key);
          _this.setData({
            postImageLeft: app.globalData.imageUrl+key
          });
          if (_this.postImageLeft != '' && _this.PostImageRight != ''){
            _this.setData({
              showBegin: false,
              showCancel: true,
              showSubmit: true,
              tryAgant: false
            });
          }
        })

      }
    })
  },

  /**
   * 选择图片
   */
  selectRight:function(){
    this.setData({ showReport: false})
    let _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        console.log('图片：' + res.tempFilePaths);
        var tempFilePaths = res.tempFilePaths;
        _this.setData({
          imageRight: tempFilePaths[0]
        });
        wx.showLoading({
          title: '加载中',
        });

        uploader.upload(tempFilePaths[0], key => {
          wx.hideLoading();
          console.log(key);
          _this.setData({
            PostImageRight: app.globalData.imageUrl+key
          });

          if (_this.postImageLeft != '' && _this.PostImageRight != '') {
            _this.setData({
              showBegin: false,
              showCancel: true,
              showSubmit: true,
              tryAgant: false,
            });
          }
        })

      }
    })
  },

  /**
   * 提交数据
   */
  submit:function(){
    console.log(this.data.PostImageRight);
    console.log(this.data.postImageLeft);

    if (this.data.postImageLeft == ''){
      wx.showLoading({
        title: '左图上传失败，请重试',
      });
      setTimeout(function(){
        wx.hideLoading();
      },1500);
      return false;
    }

    if (this.data.PostImageRight == '') {
      wx.showLoading({
        title: '右图上传失败，请重试',
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 1500);
      return false;
    }

    wx.showLoading({
      title: '检测中',
    });

    app.http('post', `/compare_face`,
      { your_face: this.data.postImageLeft, his_face: this.data.PostImageRight },         res => {
        wx.hideLoading();
        console.log('数据：' + JSON.stringify(res.data));
        if (res.data.error_code){
          wx.showLoading({
            title: res.data.error_message,
          });
          setTimeout(function () {
            wx.hideLoading();
          }, 2000);
          return false;
        }
      
        let response = res.data;
        this.setData({
            rate: response.data.confidence,
            face: response.data.key_world,
            conclusion: response.data.message,
            showReport: true,
            bindReport: true
        });
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
   * 再来一次
   */
  tryAgant:function(){
    this.setData({
      rate: 0,
      face: '',
      conclusion: '',
      showReport: false,
      bindReport: false,
      showCancel: true,
      tryAgant: false,
      showBegin: false,
      showSubmit: false,
      postImageLeft: '',
      PostImageRight: '',
      imageLeft: '',
      imageRight: '',
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