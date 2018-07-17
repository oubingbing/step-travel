
const distance = require('../../utils/dist');
const app = getApp()

Page({
  data: {
    plans:[],
    pageNumber: 1,
    initPageNumber: 1,
    pageSize: 10,
    showGeMoreLoadin:false
  },
  onLoad: function () {
    this.getList();
  },
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap')
  },

  getList:function(){
    let _this = this;
    let order_by = 'created_at';
    let sort_by = 'desc';
    app.http('GET', `/plans?page_size=${_this.data.pageSize}&page_number=${_this.data.pageNumber}&order_by=${order_by}&sort_by=${sort_by}`, {}, function (res) {
      console.log(res.data.data);
      let resData = res.data.data;
      let plans = _this.data.plans;
      if(resData.page_data){
        resData.page_data.map(item=>{
          plans.push(item)
        })
      }

      _this.setData({
        plans:plans,
        pageNumber: _this.data.pageNumber + 1 ,
        showGeMoreLoadin:false
      })
    });
  },

  openDetail: function (e) {
    let id = e.currentTarget.dataset.objid;
    wx.navigateTo({
      url: '/pages/travel_detail/travel_detail?id='+id
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    let _this = this;
    _this.setData({
      showGeMoreLoadin:true
    })
    this.getList(_this);
  },

})
