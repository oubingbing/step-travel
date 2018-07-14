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
      dottedLine: true,
      arrowLine:true,
      planId:''
    }],
    logs:[],
    pageSize: 4,
    pageNumber: 1,
    initPageNumber: 1,
  },
  onLoad:function(){
    this.plan();
    qqmapsdk = new QQMapWX({
      key: 'XCDBZ-EG7C6-2OIS6-MSJDG-OQ2FT-2EBED'
    });
  },
  onReady: function (e) {
    
    this.travelLogs();
  },

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
    let _this = this;
    app.http('get', `/plan`,{}, res => {

        console.log(res.data.data);
        let resData = res.data.data;
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
          travelLogs.map((item,key)=>{
            //标记坐标点
            markers.push({
              id: key,
              latitude: item.latitude,
              longitude: item.longitude,
              width: 50,
              height: 50
            });
          })

          //缩放地图
          let includePoints = _this.data.includePoints;
          includePoints.push({ longitude: 113.93694, latitude: 22.5326 })
          includePoints.push({ 
            longitude: 114.029246, 
            latitude: 22.609562
          })

          //画线
          polyline[0].points = points;
          _this.setData({
            polyline: polyline,
            latitude: planPoints[0].latitude,
            longitude: planPoints[0].longitude,
            includePoints: includePoints,
            markers: markers,
            planId:resData.id
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
            logs: logs
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
              _this.updateLog(item.id, name, address);
            }
          },
          fail: function (res) {
            console.log(res);
          }
        });
      }
    })
  },

  updateLog:function(logId,name,address){
    app.http('put', `/update_log`,
      {
        name: name,
        address: address,
        log_id: logId
      }, res => {

        console.log(res);

      });
  },

  /**
   * 获取附近的咨询
   */
  getPoi:function(_this,logs){
    logs.map(item=>{
      if(item.hotel == ''){
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
  }
})
