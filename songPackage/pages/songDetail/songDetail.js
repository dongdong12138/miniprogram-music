import PubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../../utils/request'

const appInstance = getApp()

Page({
  data: {
		isPlay: false,
		musicId: '',
		song: {},
		musicLink: '',
    currentTime: '00:00',		// 音乐实时时间
    durationTime: '00:00',	// 音乐总时长
    currentWidth: 0,				// 音乐实时进度条的宽度
  },
  onLoad(options) {
		const musicId = options.musicId
		this.setData({ musicId })

    // 获取音乐详情
		this.getMusicInfo(musicId)

		// 判断当前页面音乐是否在播放
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      this.setData({ isPlay: true })
    }
    // 创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager()
    // 监视音乐播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true)
      // 修改全局音乐播放的状态
      appInstance.globalData.musicId = musicId
    })
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false)
    })
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false)
    })
    // 监听音乐播放自然结束
    this.backgroundAudioManager.onEnded(() => {
      // 自动切换至下一首音乐，并且自动播放
      PubSub.publish('switchType', 'next')
      // 将实时进度条的长度还原成 0；时间还原成 0；
      this.setData({ currentWidth: 0, currentTime: '00:00' })
    })
    // 监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 450
      this.setData({ currentTime, currentWidth })
    })
  },
	// 点击播放/暂停
  handleMusicPlay(){
    let isPlay = !this.data.isPlay
    let { musicId, musicLink } = this.data
    this.musicControl(isPlay, musicId, musicLink)
	},
	// 控制音乐播放/暂停
  async musicControl(isPlay, musicId, musicLink) {
    if (isPlay) {
      if (!musicLink) {
        // 获取音乐播放链接
        let musicLinkData = await request('/song/url', {id: musicId})
        musicLink = musicLinkData.data[0].url
        this.setData({ musicLink })
      }
      this.backgroundAudioManager.src = musicLink
      this.backgroundAudioManager.title = this.data.song.name
    } else {
      this.backgroundAudioManager.pause()
    }
  },
	// 获取音乐详情的功能函数
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', {ids: musicId})
    let durationTime = moment(songData.songs[0].dt).format('mm:ss')
    this.setData({ song: songData.songs[0], durationTime })
    // 动态修改窗口标题
    wx.setNavigationBarTitle({ title: this.data.song.name })
	},
	// 修改播放状态的功能函数
  changePlayState(isPlay){
    this.setData({ isPlay })
    appInstance.globalData.isMusicPlay = isPlay
	},
	// 点击切歌
  handleSwitch(event){
    let type = event.currentTarget.id
    // 关闭当前播放的音乐
    this.backgroundAudioManager.stop()
    // 订阅来自 recommendSong 页面发布的 musicId 消息
    PubSub.subscribe('musicId', (msg, musicId) => {
      // 获取音乐详情信息
      this.getMusicInfo(musicId)
      // 自动播放当前的音乐
      this.musicControl(true, musicId)
      // 取消订阅
      PubSub.unsubscribe('musicId')
    })
    // 发布消息数据给 recommendSong 页面
    PubSub.publish('switchType', type)
  },
})
