import request from '../../utils/request'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		phone: '',
		password: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

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

	},

	handleInput(event) {
		const { type } = event.currentTarget.dataset
		this.setData({ [type]: event.detail.value })
	},
	async login() {
		let { phone, password } = this.data
		if (!phone) {
			return wx.showToast({ title: '手机号不能为空', icon: 'none' })
		}
		const phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
		if (!phoneReg.test(phone)) {
			return wx.showToast({ title: '手机号格式错误', icon: 'none' })
		}
		if (!password) {
			return wx.showToast({ title: '密码不能为空', icon: 'none' })
		}
		let result = await request('/login/cellphone', { phone, password, isLogin: true })
		if (result.code === 200) {
			wx.showToast({ title: '登录成功' })
			this.reLaunchPersonal(result.profile)
		} else if (result.code === 400) {
			wx.showToast({ title: '手机号错误', icon: 'none' })
		} else if (result.code === 502) {
			wx.showToast({ title: '密码错误', icon: 'none' })
		} else {
			wx.showToast({ title: '登录失败，请重新登录', icon: 'none' })
			// 若登录失败，使用测试数据作为用户信息
			let result = await request('/user/detail?uid=32953014')
			this.reLaunchPersonal(result.profile)
		}
	},
	reLaunchPersonal(userInfo={}) {
		// 将用户的信息存储至本地
		wx.setStorageSync('userInfo', JSON.stringify(userInfo))
		// 跳转至个人中心页
		wx.reLaunch({ url: '/pages/personal/personal' })
	}
})
