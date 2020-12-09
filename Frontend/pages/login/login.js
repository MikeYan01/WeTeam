// pages/login/login.js
const app = getApp();

Page({
  data: {
    username: '',
    password: '',
    student_id: '',
    profile_photo: '',
    is_teacher: '',
    attended_course_ids: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  // 用户名
  userNameInput:function(e) {
    this.setData({username:e.detail.value})
  },
  // 学号
  userNumInput:function(e) {
    this.setData({ student_id: e.detail.value })
  },
  // 密码
  passWdInput:function(e) {
    this.setData({password:e.detail.value})
  },
  // 点击登录按钮事件
  loginBtnClick:function() {
    var that = this;
    if (that.data.username == "" || that.data.student_id == "" || that.data.password == "") {
      wx.showToast({
        title: '请完整填写信息！',
        icon: 'none',
        duration: 3000
      })
    }
    else if (isNaN(that.data.student_id)) {
      wx.showToast({
        title: '请输入有效的学工号！',
        icon: 'none',
        duration: 3000
      })
    }
    else if (that.data.student_id.length > 20 || that.data.username.length > 20) {
      wx.showToast({
        title: '输入的用户名或学工号过长！',
        icon: 'none',
        duration: 3000
      })
    }
    else if (that.data.password != that.data.student_id + "010") {
      wx.showToast({
        title: '密码错误！',
        icon: 'none',
        duration: 2000
      })
    }
    else if (!that.data.hasUserInfo && that.data.canIUse) {
      wx.showToast({
        title: '请授权获取头像昵称！',
        icon: 'none',
        duration: 3000
      })
    }
    else {
      wx.request({
        url: 'http://jihanyang.cn:8080/get_user',
        method: 'GET',
        data: {
          student_id: that.data.student_id
        },

        success: function (res) {
          // 获取当前登陆用户的部分信息
          wx.setStorageSync('user_id', res.data.student_id);
          wx.setStorageSync('username', res.data.username);
          wx.setStorageSync('attended_id', res.data.attended_course_ids);

          // 新用户，默认当作学生，加入数据库
          if (res.data == "Cannot find such a student") {
            wx.request({
              url: 'http://jihanyang.cn:8080/add_user',
              method: 'POST',
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              data: {
                student_id: that.data.student_id,
                username: that.data.username,
                is_teacher: '0',
                profile_photo: that.data.userInfo.avatarUrl,
                attended_course_ids: 'None'
              },
              // 将当前登录的用户信息存入缓存
              success: function(Res) {
                console.log(Res);
                wx.setStorageSync('user_id', Res.data.student_id);
                wx.setStorageSync('username', Res.data.username);
                wx.setStorageSync('attended_id', Res.data.attended_course_ids);
              }
            })
            wx.redirectTo({
              url: '../student_index/student_index',
            })
          }
          // 老用户，判断是学生还是老师，进行跳转
          else {
            if (res.data.username == that.data.username && res.data.student_id == that.data.student_id) {
              if (res.data.is_teacher == false) {
                wx.redirectTo({
                  url: '../student_index/student_index',
                })
              }
              else {
                wx.redirectTo({
                  url: '../teacher_index/teacher_index',
                })
              }
            }
            else {
              wx.showToast({
                title: '用户名或学工号输入错误！',
                icon: 'none',
                duration: 3000
              })
            }
          }
        },
      })
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } 
    else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
    else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})