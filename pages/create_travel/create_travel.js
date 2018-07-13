var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
const distance = require('../../utils/dist');
var qqmapsdk;

Page({
  data: {
    latitude: 26.2304,
    longitude: 108.2045,
    plans: [],
    markers: [
      {
        longitude: 100,
        latitude: 20
      }
    ],

    markers: [{
      iconPath: "image/location.png",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 50,
      height: 50
    }],

    polyline: [{
      points: [
        {
          longitude: 100,
          latitude: 20
        },
        {
          latitude: 26.2304,
          longitude: 108.2045,
        }
      ],
      color: "#66CDAA",
      width: 3,
      dottedLine: false
    }],
  },
  onLoad: function () {

    let coords = [[29.21229, 103.324520], [26.21229, 108.58195102022]];// [[lat,lng]];
    let lens = distance(coords);
    console.log(lens + '米'); //单位米

  },
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap')

  },
  test: function (res) {
    //微信小程序地图SDK
    qqmapsdk = new QQMapWX({
      key: 'XCDBZ-EG7C6-2OIS6-MSJDG-OQ2FT-2EBED'
    });

    qqmapsdk.calculateDistance({
      mode: 'driving',
      to: [{
        latitude: 22.511,
        longitude: 113.9424
      }],
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },
  getCenterLocation: function () {
    this.mapCtx.getCenterLocation({
      success: function (res) {
        console.log(res.longitude)
        console.log(res.latitude)
      }
    })
  },
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  translateMarker: function () {
    this.mapCtx.translateMarker({
      markerId: 1,
      autoRotate: true,
      duration: 1000,
      destination: {
        latitude: 23.10229,
        longitude: 113.3345211,
      },
      animationEnd() {
        console.log('animation end')
      }
    })
  },
  includePoints: function () {
    this.mapCtx.includePoints({
      padding: [10],
      points: [{
        latitude: 23.10229,
        longitude: 113.3345211,
      }, {
        latitude: 23.00229,
        longitude: 113.3345211,
      }]
    })
  },
  /**
   * 选择旅行站点
   */
  chooseLocation: function () {
    let _this = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res);
        let plans = _this.data.plans;
        let plan = {id:plans.length,name:res.name, latitude:res.latitude, longitude:res.longitude};
        plans.push(plan);
        _this.setData({
          plans: plans
        })
        
      },
      fail: function (err) {
        console.log(err)
      },
      complete: function (res) {
        //console.log(res);
      }
    })
  },

  sumDistance:function(){
    let plans = this.data.plans;
    plans.map(item=>{
      console.log(item.latitude);
      //let coords = [[item[2].name], [26.21229, 108.58195102022]];// [[lat,lng]];
      //let lens = distance(coords);
    });
  }
})
