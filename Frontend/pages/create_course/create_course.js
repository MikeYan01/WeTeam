// pages/create_course/create_course.js
const app = getApp();

Page({
  data: {
    array1: ['一', '二', '三', '四', '五', '六', '日'],
    array2: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    array3: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    teacher_id: '0',
    name: '',
    index1: '',
    index2: '',
    index3: '',
    course_time: '',
    start_time: '',
    end_time: '',
    min_team: 0,
    max_team: 0,
    team_ids: 'None',
    student_ids: 'None',
    course_info: '',
    student_id: '',
    course_id: '',
    attended_course_ids: 'None',
  },
  // 课程名
  bindCourseName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  // 星期几
  bindPickerChange1: function (e) {
    this.setData({
      index1: e.detail.value
    })
  },
  // 起始节数
  bindPickerChange2: function (e) {
    this.setData({
      index2: e.detail.value
    })
  },
  // 终止节数
  bindPickerChange3: function (e) {
    this.setData({
      index3: e.detail.value
    })
  },
  // 开始组队日期
  bindDateChange1: function (e) {
    this.setData({
      start_time: e.detail.value
    })
  },
  // 截止组队日期
  bindDateChange2: function (e) {
    this.setData({
      end_time: e.detail.value
    })
  },
  // 最小组队人数
  bindMinPeople: function(e) {
    this.setData({
      min_team: e.detail.value
    })
  },
  // 最大组队人数
  bindMaxPeople: function (e) {
    this.setData({
      max_team: e.detail.value
    })
  },
  // 课程信息
  bindCourseInfo: function (e) {
    this.setData({
      course_info: e.detail.value
    })
  },
  
  // 确认创建按钮
  cfmBtnClick: function() {
    var that = this;
    if (this.data.course_info == '' || this.data.name == '' || this.data.index1 == '' || this.data.index2 == '' ||
      this.data.index3 == '' || this.data.start_time == '' || this.data.end_time == '' || this.data.min_team == ''
      || this.data.max_team == '') {
      wx.showToast({
        title: '课程信息未填写完整！',
        icon: 'none',
        duration: 3000
      })
    }

    else if (parseInt(this.data.index2) >= parseInt(this.data.index3)) {
      wx.showToast({
        title: '课程起始节数必须小于终止节数！',
        icon: 'none',
        duration: 3000
      })
    }
    
    else if (this.data.start_time >= this.data.end_time) {
      wx.showToast({
        title: '组队截止时间不能晚于起始时间！',
        icon: 'none',
        duration: 3000
      })
    }

    else if (isNaN(this.data.min_team) || isNaN(this.data.max_team) || parseInt(this.data.min_team) <= 0 
      || parseInt(this.data.max_team) <= 0 || Math.round(this.data.min_team) != this.data.min_team || Math.round(this.data.max_team) != this.data.max_team) {
      wx.showToast({
        title: '请输入有效组队人数！',
        icon: 'none',
        duration: 3000
      })
    }

    else if (parseInt(this.data.min_team) >= parseInt(this.data.max_team)) {
      wx.showToast({
        title: '最小组队人数必须小于最大组队人数！',
        icon: 'none',
        duration: 3000
      })
    }

    else if (this.data.course_info.replace(/[^x00-xFF]/g, '**').length > 200) {
      wx.showToast({
        title: '您输入的组队信息过长！',
        icon: 'none',
        duration: 3000
      })
    }
    
    else {
      // 课程表中加入课程
      wx.request({
        url: 'http://jihanyang.cn:8080/add_course',
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        data: {
          teacher_id: wx.getStorageSync('user_id'),
          course_info: this.data.course_info,
          name: this.data.name,
          course_time: '星期' + this.data.array1[this.data.index1] + this.data.array2[this.data.index2] + '~' + this.data.array3[this.data.index3] + '节',
          start_time: this.data.start_time,
          end_time: this.data.end_time,
          min_team: this.data.min_team,
          max_team: this.data.max_team,
          team_ids: 'None',
          student_ids: 'None'
        },

        success: function (res) {
          console.log(res);
          if (res.data == 'Already have this class') {
            wx.showToast({
              title: '该课程已存在，请勿重复创建课程！',
              icon: 'none',
              duration: 3000
            })
          }

          else {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '课程创建成功！',
              success: function (Res) {
                if (that.data.attended_course_ids == 'None' || that.data.attended_course_ids == '') that.setData({ attended_course_ids: res.data.course_id.toString() })
                else that.setData({ attended_course_ids: that.data.attended_course_ids + "@" + res.data.course_id.toString()})
                wx.setStorageSync('attended_id', that.data.attended_course_ids)

                if (Res.confirm) {
                  // 用户表中，修改教师的参与课程
                  wx.request({
                    url: 'http://jihanyang.cn:8080/modify_attended_course',
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    method: "POST",
                    data: {
                      student_id: wx.getStorageSync('user_id'),
                      attended_course_ids: that.data.attended_course_ids
                    },
                    success: function (res) { console.log(res) }
                  })
                  wx.redirectTo({
                    url: "../teacher_index/teacher_index",
                  })
                }
              }
            })  
          }
       
        },
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    wx.request({
      url: 'http://jihanyang.cn:8080/get_user',
      method: 'GET',
      data: {
        student_id: wx.getStorageSync('user_id'),
      },
      success: function (res) {
        console.log(res);
        that.setData({
          attended_course_ids: res.data.attended_course_ids
        })
      }
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