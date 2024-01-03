import request from '../../utils/request'

// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		bannerList: [],
		iconList: [
			{icon: 'icon-meirituijian', text: '每日推荐'}, {icon: 'icon-gedan1', text: '歌单'}, {icon: 'icon-icon-ranking', text: '排行榜'},
			{icon: 'icon-diantai', text: '电台'}, {icon: 'icon-zhiboguankanliangbofangsheyingshexiangjixianxing', text: '直播'},
		]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
		let bannerListData = await request('/banner', {type: 2})
		this.setData({ bannerList: bannerListData.banners })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})