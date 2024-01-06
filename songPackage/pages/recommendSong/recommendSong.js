import PubSub from 'pubsub-js'
import request from '../../../utils/request'

Page({
  data: {
		day: '',
		month: '',
		recommendList: [],
		index: 0,		// 点击音乐的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
		// 判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo')
    if(!userInfo){
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          wx.reLaunch({ url: '/pages/login/login' })
        }
      })
		}
		// 设置日期
		this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1
		})
		// 获取每日推荐的数据
		this.getRecommendList()

		// 订阅来自 songDetail 页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      let { recommendList, index } = this.data
      if (type === 'pre') {
        (index === 0) && (index = recommendList.length)
        index -= 1
      } else {
        (index === recommendList.length - 1) && (index = -1)
        index += 1
      }
      this.setData({ index })
      let musicId = recommendList[index].id
      PubSub.publish('musicId', musicId)
    })
  },

	// 获取用户每日推荐数据
  async getRecommendList() {
		let recommendListData = await request('/recommend/songs')
		console.log('recommendListData:', recommendListData)
    this.setData({ recommendList: recommendListData.recommend })
	},
	// 跳转至 songDetail 页
  toSongDetail(event) {
    let { song, index } = event.currentTarget.dataset
    this.setData({ index })
    wx.navigateTo({ url: '/songPackage/pages/songDetail/songDetail?musicId=' + song.id })
  },
})