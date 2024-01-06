import request from '../../utils/request'

let isSend = false		// 函数节流使用

Page({
	data: {
		placeholderContent: '',
		hotList: [],
		searchContent: '',
		searchList: [],
		historyList: [],
	},
	onLoad(options) {
		// 获取初始化数据
		this.getInitData()
		// 获取历史记录
		this.getSearchHistory()
	},
	// 获取初始化的数据
	async getInitData() {
		let placeholderData = await request('/search/default')
		let hotListData = await request('/search/hot/detail')
		this.setData({
			placeholderContent: placeholderData?.data?.showKeyword,
			hotList: hotListData.data
		})
	},
	// 获取本地历史记录的功能函数
	getSearchHistory() {
		let historyList = wx.getStorageSync('searchHistory')
		if (historyList) {
			this.setData({ historyList })
		}
	},
	// 表单项内容发生改变的回调
	handleInputChange(event) {
		this.setData({ searchContent: event.detail.value.trim() })
		if (isSend) return
		isSend = true
		this.getSearchList()
		// 函数节流
		setTimeout(() => {
			isSend = false
		}, 300)
	},
	// 获取搜索数据的功能函数
	async getSearchList() {
		if (!this.data.searchContent) {
			this.setData({ searchList: [] })
			return
		}
		let { searchContent, historyList } = this.data
		let searchListData = await request('/search', { keywords: searchContent, limit: 10 })
		this.setData({ searchList: searchListData.result.songs })
		// 将搜索的关键字添加到搜索历史记录中
		if (historyList.indexOf(searchContent) !== -1) {
			historyList.splice(historyList.indexOf(searchContent), 1)
		}
		historyList.unshift(searchContent)
		this.setData({ historyList })
		wx.setStorageSync('searchHistory', historyList)
	},
	// 清空搜索内容
	clearSearchContent() {
		this.setData({ searchContent: '', searchList: [] })
	},
	// 删除搜索历史记录
	deleteSearchHistory() {
		wx.showModal({
			content: '确认删除吗?',
			success: (res) => {
				if (res.confirm) {
					this.setData({ historyList: [] })
					wx.removeStorageSync('searchHistory')
				}
			}
		})
	},
})