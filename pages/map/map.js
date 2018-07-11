var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
const distance = require('../../utils/dist');
var qqmapsdk;

Page({
  data: {
    latitude: 23.099994,
    longitude: 113.324520,
    markers: [{
      id: 1,
      latitude: 23.099994,
      longitude: 113.324520,
      name: 'T.I.T 创意园'
    }],
    
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
      points: [{
        longitude: 113.3245211,
        latitude: 23.10229
      },
        {
          longitude: 103.324520,
          latitude: 29.21229
        },
       {
        longitude: 99.324520,
        latitude: 36.21229
      }],
      color: "#FF0000DD",
      width: 8,
      dottedLine: false
    },
      {
        points: [{
          longitude: 113.3245211,
          latitude: 23.10229
        },
        {
          longitude: 108.58195102022,
          latitude: 26.21229
        },
        {
          longitude: 103.324520,
          latitude: 29.21229
        }],
        color: "#66CDAA",
        width: 2,
        dottedLine: false
      }
    ],
  },
  onLoad:function(){
    
    let coords = [[23.104997, 114.428101], [22.543001, 114.071045]];// [[lat,lng]];
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
})
