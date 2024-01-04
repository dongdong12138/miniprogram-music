import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
		videoGroupList: [],
		navId: '',
		videoList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
		this.getVideoGroupListData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

	},
	
	// 获取导航数据
  async getVideoGroupListData() {
  	let videoGroupListData = await request('/video/group/list')
  	this.setData({
  		videoGroupList: videoGroupListData.data.slice(0, 14),
  		navId: videoGroupListData.data[0].id
		})
    this.getVideoList(this.data.navId)
	},
	// 获取视频列表数据
  async getVideoList(navId) {
    if (!navId) return
		let videoListData = await request('/video/group', {id: navId})
		console.log('videoListData:', videoListData)
    wx.hideLoading()
    let index = 0
    let videoList = videoListData.datas.map(item => {
      item.id = index++
      return item
    })
    this.setData({ videoList, isTriggered: false })
  },
	// 点击切换导航
	changeNav(event) {
		let navId = event.currentTarget.id
		this.setData({ navId: navId >>> 0, videoList: [] })
    wx.showLoading({ title: '正在加载' })
    this.getVideoList(this.data.navId)
	},
})