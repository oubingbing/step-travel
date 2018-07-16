var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
const distance = require('../../utils/dist');
const app = getApp()
var qqmapsdk;

Page({
  data: {
    latitude: 0,
    longitude: 0,
    includePoints: [],
    markers: [],
    polyline: [{
      points: [],
      color: "#FF4500",
      width: 3,
      dottedLine: false
    }],
    logs:[],
    pageSize: 4,
    pageNumber: 1,
    initPageNumber: 1,
    plan:'',
    showPostPlan:false,
    avatar:'',
    showReport:false,
    showMap:true
  },
  onLoad:function(){
    this.plan();
    qqmapsdk = new QQMapWX({
      key: 'XCDBZ-EG7C6-2OIS6-MSJDG-OQ2FT-2EBED'
    });

    let _this = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        let includePoints = _this.data.includePoints;
        includePoints.push({
          longitude: longitude,
          latitude: latitude
        })

        _this.setData({
          latitude: latitude,
          longitude: longitude,
          includePoints: includePoints
        })
      }
    })

  },
  onReady: function (e) {
    this.travelLogs();

    this.downLoadAvatar();
  },
  onShow:function(){
    if (app.newTravelPlan == true){
      this.setData({
        includePoints: [],
        markers: [],
        polyline: [{
          points: [],
          color: "#FF4500",
          width: 3,
          dottedLine: false
        }],
        logs: [],
        pageSize: 4,
        pageNumber: 1,
        initPageNumber: 1,
        plan: '',
        showPostPlan: false
      })
      this.plan();
      this.travelLogs();
      app.newTravelPlan = false;
    }
  },

  /**
   * 下载用户头像
   */
  downLoadAvatar:function(){
    let avatar = wx.getStorageSync('avatar');
    let _this = this;
    console.log(avatar);
    let avatarImage = wx.getStorageSync('avatar');
    if (avatarImage == ''){
      wx.downloadFile({
        url: 'https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKWJ8B1DG0aIN3LVa6GEuo3Hgf1eIj8coyPY4wZyrJ3NMZBWhUNefdxJ0iamZDvJxBUQsicV3mwSN6Q/132',
        success: function (res) {
          if (res.statusCode === 200) {
            wx.playVoice({
              filePath: res.tempFilePath
            })
            console.log(res);
            _this.setData({
              avatar: res.tempFilePath
            })
            wx.setStorageSync('avatar', res.tempFilePath);
          }
        }
      })
    }else{
      _this.setData({
        avatar: avatarImage
      })
    }
  },

  /**
   * 隐藏报告
   */
  hideReport:function(){
    console.log('隐藏');
    this.setData({
      showReport: false,
      showMap:true
    })
  },

  /**
   * 绘制报告
   */
  drawReport:function(){

      this.setData({
        showReport:true,
        showMap:false
      })
      let avatarImage = wx.getStorageSync('avatar');
      console.log(wx.getSystemInfoSync().windowWidth);
      let windowWidth = (wx.getSystemInfoSync().windowWidth - 35);
      let windowHeight = wx.getSystemInfoSync().windowHeight;
      let avatar = this.data.avatar;

      console.log('头像：'+avatar);
      console.log(wx.getSystemInfoSync());
      console.log('高度：' + windowHeight);
      const ctx = wx.createCanvasContext('myCanvas')

      //ctx.setStrokeStyle('red')
      //ctx.moveTo(windowWidth / 2, 20)
      //ctx.lineTo(windowWidth / 2, 170)
      //ctx.stroke()

      ctx.drawImage('/image/bg-report.jpg', 0, 0, (windowWidth / 1), (windowHeight - (windowHeight / 8)));

      ctx.setFontSize(15)
      ctx.setFillStyle('#FFFFFF')
      ctx.setTextAlign('left')
      ctx.fillText('叶子', (windowWidth / 2), 80)
      ctx.fillText('旅行中', (windowWidth / 2), 100)

      ctx.setTextAlign('center')
      ctx.fillText('步数旅行者', windowWidth / 2, 30)
      ctx.fillText('深圳北站', windowWidth / 2, 155)
      ctx.drawImage('/image/jiantou.png', (windowWidth / 2) - (windowWidth / 30), 160, 20, 20);
      ctx.fillText('北京天安门', windowWidth / 2, 195)
      ctx.fillText('旅行了5个省，30座城市', windowWidth / 2, 240)
      ctx.fillText('住了50个酒店', windowWidth / 2, 270)
      ctx.fillText('游玩了100个景点', windowWidth / 2, 300)
      ctx.fillText('下了90次馆子', windowWidth / 2, 330)
      ctx.fillText('里程：400公里', (windowWidth / 2) - 70, 360)
      ctx.fillText('步数：20000', (windowWidth / 2)+70, 360)
      ctx.save();
      ctx.setFillStyle('#CD2626')
      ctx.drawImage('/image/qrcode.jpg', (windowWidth / 2) + (windowWidth / 4), (windowHeight - (windowHeight/4)), 60, 60)
      ctx.drawImage(avatarImage, (windowWidth / 2) - 70, 55, 60, 60)
      ctx.draw();
      

  },

  /**
   * 保存报告
   */
  saveReport:function(){
    wx.authorize({
      scope: "scope.writePhotosAlbum", success(res) {
        console.log('授权获得微信运动数据');
        wx.canvasToTempFilePath({
          canvasId: 'myCanvas',
          success: function success(res) {
            console.log(res.tempFilePath)
            let image = res.tempFilePath;
            wx.saveImageToPhotosAlbum({
              filePath: image,
              success(res) {
                console.log(res)
                wx.showLoading({
                  title: '保存成功！',
                });
                setTimeout(function () {
                  wx.hideLoading();
                }, 1000)
              }
            })
          },
          complete: function complete(e) {
            console.log(e.errMsg);
          }
        });
      }
    })
  },

  /**
   * 保存周边咨询
   */
  savePoi:function(logId,title,address,poiType){
    app.http('post', `/create_poi`,
      {
        title: title,
        address: address,
        type:poiType,
        log_id:logId
      }, res => {
        console.log(res);
      });
  },

  /**
   * 获取计划
   */
  plan:function(){
    console.log('plan');
    let _this = this;
    app.http('get', `/plan`,{}, res => {

        console.log(res.data.data);
        let resData = res.data.data;
        if(resData == null){
          _this.setData({
            showPostPlan:true
          })

          return false;
        }


        if(res.data.error_code == 0){
          let markers = _this.data.markers;
          let polyline = _this.data.polyline;
          let points = polyline[0].points;
          let planPoints = resData.points;
          planPoints.map(item=>{
            points.push({
              longitude: item.longitude,
              latitude: item.latitude
            });
          })

          let travelLogs = resData.travel_logs;
          let finishPoint = [];
          travelLogs.map((item,key)=>{
            //标记坐标点
            markers.push({
              id: key,
              latitude: item.latitude,
              longitude: item.longitude,
              width: 50,
              height: 50
            });
            finishPoint.push({
              latitude: item.latitude,
              longitude: item.longitude,
            });
          })

          let finishPolyline = {
            points: finishPoint,
            color: "#FF4500",
            width: 3,
            dottedLine: true,
            arrowLine: true
          };
          polyline.push(finishPolyline)

          //缩放地图
          let includePoints = _this.data.includePoints;
          if (travelLogs.length > 0){
            //includePoints.push({ longitude: travelLogs[0].longitude, latitude: travelLogs[0].latitude })
            includePoints.push({ longitude: travelLogs[travelLogs.length - 1].longitude, latitude: travelLogs[travelLogs.length - 1].latitude })
          }

          //画线
          polyline[0].points = points;
          _this.setData({
            polyline: polyline,
            latitude: planPoints[0].latitude,
            longitude: planPoints[0].longitude,
            includePoints: includePoints,
            markers: markers,
            planId:resData.id,
            plan: resData
          })
        }
      });

  },

  /**
   * 获取旅行日志
   */
  travelLogs:function(){
    let _this = this;
    app.http('GET',`/ravel_logs?page_size=${_this.data.pageSize}&page_number=${_this.data.pageNumber}`,
      {},
      function (res) {
        console.log(res.data.data.page_data);
        let logData = res.data.data.page_data;
        if(logData != null){
          let logs = _this.data.logs;
          logData.map(item=>{
            logs.push(item);
          })
          _this.setData({
            logs: logs,
            pageNumber: _this.data.pageNumber + 1 
          })
         _this.exchangeLocation(_this,logData);
          _this.getPoi(_this, logData);
        }
      });
  },

  /**
   * 获取地理名字
   */
  exchangeLocation: function (_this,logs){
    logs.map(item => {
      if (item.name == ''){
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: item.latitude,
            longitude: item.longitude
          },
          success: function (res) {
            console.log(res);
            if (res.status == 0) {
              let name = res.result.formatted_addresses.recommend
              let address = res.result.address
              let theLogs = _this.data.logs;
              let newLogs = theLogs.map(sub_item => {
                if (sub_item.id == item.id) {
                  sub_item.name = name;
                  sub_item.address = address;
                }
                return sub_item;
              })
              console.log('new logs' + newLogs);
              _this.setData({
                logs: newLogs
              })
              let ad_info = res.result.ad_info;
              let province = ad_info.province;
              let city = ad_info.city;
              let district = ad_info.district;
              _this.updateLog(item.id, name, address, province, city, district);
            }
          },
          fail: function (res) {
            console.log(res);
          }
        });
      }
    })
  },

  /**
   * 更新日志的地理信息
   */
  updateLog: function (logId, name, address, province, city, district){
    app.http('put', `/update_log`,
      {
        name: name,
        address: address,
        log_id: logId,
        province: province,
        district: district,
        city:city
      }, res => {

        console.log(res);

      });
  },

  /**
   * 获取附近的咨询
   */
  getPoi:function(_this,logs){
    logs.map(item=>{
      if(item.hotel == null){
        _this.getPoiHotel(_this, item.id, item.latitude, item.longitude);
      }
      if (item.foods == ''){
        _this.getPoiFood(_this, item.id, item.latitude, item.longitude);
      }
      if(item.views == ''){
        _this.getPoiView(_this, item.id, item.latitude, item.longitude);
      }
    })
  },

  /**
   * 获取酒店信息
   */
  getPoiHotel: function (_this,id, latitude, longitude){
    qqmapsdk.search({
      keyword: "酒店",
      page_size: 1,
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        console.log(res);
        if (res.status == 0) {
          let hotel = res.data[0].title
          let theLogs = _this.data.logs;
          let newLogs = theLogs.map(sub_item => {
            if (sub_item.id == id) {
              sub_item.hotel = hotel;
            }
            return sub_item;
          })
          console.log('new logs' + newLogs);
          _this.setData({
            logs: newLogs
          })
          _this.savePoi(id, hotel, res.data[0].address, 1)
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * 获取美食
   */
  getPoiFood: function (_this, id, latitude, longitude) {
    qqmapsdk.search({
      keyword: "美食",
      page_size: 5,
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        console.log(res);
        if (res.status == 0) {
          let foods = res.data;
          let theLogs = _this.data.logs;
          let newLogs = theLogs.map(sub_item => {
            if (sub_item.id == id) {
              sub_item.foods = foods;
            }
            return sub_item;
          })
          console.log('new logs' + newLogs);
          _this.setData({
            logs: newLogs
          })

          foods.map(item=>{
            _this.savePoi(id, item.title, item.address, 2)
          })
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * 获取景点
   */
  getPoiView: function (_this, id, latitude, longitude) {
    qqmapsdk.search({
      keyword: "景点",
      page_size: 5,
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        console.log(res);
        if (res.status == 0) {
          let views = res.data;
          let theLogs = _this.data.logs;
          let newLogs = theLogs.map(sub_item => {
            if (sub_item.id == id) {
              sub_item.views = views;
            }
            return sub_item;
          })
          console.log('new logs' + newLogs);
          _this.setData({
            logs: newLogs
          })
          views.map(item=>{
            _this.savePoi(id, item.title, item.address,3)
          })
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * 新建旅程
   */
  createTravel:function(){
    wx.navigateTo({
      url: '/pages/create_travel/create_travel'
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    let _this = this;
    this.travelLogs();
  },
})
