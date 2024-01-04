import request from '../../utils/request'
import { newVideoList } from './mock'

Page({

  /**
   * 页面的初始数据
   */
  data: {
		videoGroupList: [],
		navId: '',
		videoList: [],
		videoId: '',
		videoUpdateTime: [],
		isTriggered: false,
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
  onShareAppMessage({ from }) {
		return {
			title: from === 'button' ? '来自button的转发' : '来自menu的转发',
			page: '/pages/video/video',
			imageUrl: '/static/images/nvsheng.jpg'
		}
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
    let videoList = videoListData?.datas?.map(item => {
      item.id = index++
      return item
    })
    this.setData({ videoList: videoList || [], isTriggered: false })
  },
	// 点击切换导航
	changeNav(event) {
		let navId = event.currentTarget.id
		this.setData({ navId: navId >>> 0, videoList: [] })
    wx.showLoading({ title: '正在加载' })
    this.getVideoList(this.data.navId)
	},
	// 点击播放、继续播放
	handlePlay(event) {
		let vid = event.currentTarget.id
		// 更新 data 中 videoId 的状态数据
		this.setData({ videoId: vid })
		// 创建控制 video 标签的实例对象
		this.videoContext = wx.createVideoContext(vid)
		// 判断当前的视频之前是否播放过，是否有播放记录，如果有，跳转至指定的播放位置
		let { videoUpdateTime } = this.data
		let videoItem = videoUpdateTime.find(item => item.vid === vid)
		if (videoItem) this.videoContext.seek(videoItem.currentTime)
		this.videoContext.play()
	},
	// 监听视频播放进度
	handleTimeUpdate(event) {
		let videoTimeObj = { vid: event.currentTarget.id, currentTime: event.detail.currentTime }
		let { videoUpdateTime } = this.data
		/*
		 * 思路：判断记录播放时长的 videoUpdateTime 数组中是否有当前视频的播放记录
		 *   1. 如果有，在原有的播放记录中修改播放时间为当前的播放时间
		 *   2. 如果没有，需要在数组中添加当前视频的播放对象
		 * */
		let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid)
		if (videoItem) {
			videoItem.currentTime = event.detail.currentTime
		} else {
			videoUpdateTime.push(videoTimeObj)
		}
		this.setData({ videoUpdateTime })
	},
	// 视频播放结束
  handleEnded(event) {
    // 移除记录播放时长数组中当前视频的对象
    let { videoUpdateTime } = this.data
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id), 1)
    this.setData({ videoUpdateTime })
	},
	// 下拉刷新
  handleRefresher() {
    // 再次发请求，获取最新的视频列表数据
    this.getVideoList(this.data.navId)
	},
	// 自定义上拉触底的回调 scroll-view
  handleToLower(){
    // 数据分页： 1. 后端分页， 2. 前端分页
    console.log('发送请求 || 在前端截取最新的数据 追加到视频列表的后方')
    console.log('网易云音乐暂时没有提供分页的api')
    let videoList = this.data.videoList
    videoList.push(...newVideoList)
    this.setData({ videoList })
  },
})
