
const distance = require('../../utils/dist');
const app = getApp()

Page({
  data: {
    latitude: 0,
    longitude: 0,
    plans: [],
    travelDistance:0,
    includePoints:[],
    markers: [],
    polyline:[{
      points: [],
      color: "#FF4500",
      width: 3,
      dottedLine: true,
      arrowLine:true
    }]
  },
  onLoad: function () {

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
    this.mapCtx = wx.createMapContext('myMap')

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
        let plan = {id:plans.length,name:res.name,address:res.address, latitude:res.latitude, longitude:res.longitude};
        plans.unshift(plan);
        _this.setData({
          plans: plans
        })
        
        //画线
        let polyline = _this.data.polyline;
        let points = polyline[0].points;
        points.push({
          longitude: res.longitude,
          latitude: res.latitude
        })
        polyline[0].points = points;
        _this.setData({
          polyline: polyline
        })

        //视野缩放
        let includePoints = _this.data.includePoints;
        includePoints.push({
          longitude: res.longitude,
          latitude: res.latitude
        })

        //标记坐标点
        let markers = _this.data.markers;
        console.log("markers" + markers)
        markers.push({
          id: markers.length - 1,
          latitude: res.latitude,
          longitude: res.longitude,
          width: 50,
          height: 50,
          label:{
            content: res.name,
            fontSize:8,
            bgColor:"#FF6347",
            color:"#FFFFFF",
            padding:5,
            borderRadius:10
          }
        });

        _this.setData({
          polyline: polyline,
          includePoints: includePoints,
          markers: markers
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

  /**
   * 计算距离
   */
  sumDistance:function(){
    let plans = this.data.plans;
    let len = plans.length;
    let dist = 0;

    plans.map((item,key)=>{
      if (key == (len-1)){
        return false;
      }else{
        console.log(key);
        let coords = [[item.latitude, item.longitude], [plans[key + 1].latitude, plans[key + 1].longitude]];
        let lens = distance(coords);
        dist = dist + lens;
      }
    });

    app.http('post', `/create_travel_plan`,
      {
        title: '',
        distance: dist,
        plans: plans
      }, res => {
        console.log(res);
        if(res.data.error_code == 0){
          app.newTravelPlan = true;
          wx.showLoading({
            title: '新建成功！',
          });
          setTimeout(function(){
            wx.hideLoading();
            wx.navigateBack({ comeBack: true });
          },1000)
        }

      });
    
  }
})
