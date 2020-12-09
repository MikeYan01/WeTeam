// pages/course_info/course_info.js
Page({

  data: {
    course_id: '',
    course_info: ''
  },

  courseInfoInput: function(e) {
    this.setData({
      course_info:e.detail.value
    })
  },

  confirm: function() {
    var that = this;
    var len = that.data.course_info.replace(/[^x00-xFF]/g, '**').length;
    if (len > 200) {
      wx.showToast({
        title: '您输入的组队信息过长！',
        icon: 'none',
        duration: 3000
      })
    }
    else {
      wx.request({
        url: 'http://jihanyang.cn:8080/modify_course_info',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          course_id: that.data.course_id,
          course_info: that.data.course_info
        },
        success: function (res) {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '课程组队信息修改成功！',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: "../teacher_index/teacher_index",
                })
              }
            }
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.course_id = options.course_id;
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