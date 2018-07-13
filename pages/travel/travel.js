var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
const distance = require('../../utils/dist');
var qqmapsdk;

Page({
  data: {
    latitude: 26.2304,
    longitude: 108.2045,
    markers: [
      {
        longitude: 100,
        latitude: 20
      }
    ],
    
    covers: [{
      latitude: 23.099994,
      longitude: 113.344520,
      iconPath: '/image/location.png'
    }, {
      latitude: 23.099994,
      longitude: 113.304520,
      iconPath: '/image/location.png'
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
  onLoad:function(){
    
    let coords = [[29.21229, 103.324520], [26.21229, 108.58195102022]];// [[lat,lng]];
    let lens = distance(coords);
    console.log(lens+'米'); //单位米

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
  chooseLocation: function () {
    wx.chooseLocation({
      success: function (res) {
        console.log(res.name);
        //选择地点之后返回到原来页面
      },
      fail: function (err) {
        console.log(err)
      },
      complete: function (res) {
        console.log(res);
      }
    })
  },
  createTravel:function(){
    wx.navigateTo({
      url: '/pages/create_travel/create_travel'
    })
  }
})
