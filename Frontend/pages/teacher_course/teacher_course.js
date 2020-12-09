// pages/teacher_course/teacher_course.js
const app = getApp();

Page({
  data: {
    team_list: [],
    course_id:'',
    name: '',
    course_info:'',
    attended_course_ids: '',
    team_ids:'',
    student_ids:'',
    team_id:''
  },
  // 修改课程组队信息
  modify_info: function() {
    var temp = this.data.course_id;
    wx.navigateTo({
      url: "../course_info/course_info?course_id=" + temp,
    })
  },
  // 查看某个队伍的详情
  check_team: function(e) {
    var temp = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../teacher_team_info/teacher_team_info?team_id=' + temp,
    })
  },
  // 删除该课程
  deleteCourse: function() {
    var that = this;
    wx.showModal({
      title: '警告',
      content: '确认要删除课程？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'http://jihanyang.cn:8080/delete_course',
            method: 'POST',
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
              course_id: that.data.course_id
            },
            success: function (Res) {
              wx.showModal({
                title: '提示',
                showCancel: false,
                content: '课程删除成功！',
                success: function (res) {
                  // 删除成功后，需要相应的修改当前该教师参与的课程情况
                  if (res.confirm) {
                    var all_course = that.data.attended_course_ids.split("@");
                    var index = all_course.indexOf(that.data.course_id);
                    if (index > -1) all_course.splice(index, 1);
                    var update = all_course.join("@");
                    wx.setStorageSync('attended_id', update);

                    // 用户表中，修改教师的参与课程
                    wx.request({
                      url: 'http://jihanyang.cn:8080/modify_attended_course',
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded"
                      },
                      method: "POST",
                      data: {
                        student_id: wx.getStorageSync('user_id'),
                        attended_course_ids: update
                      },
                      success: function (res) { console.log(res) }
                    })
                    wx.redirectTo({
                      url: "../teacher_index/teacher_index",
                    })
                  }
                }
              })  
            },
          })
        }
        else if (res.cancel) {}
      }
    })
  },
  // 打印组队信息
  printGroup: function() {
    var temp = this.data.course_id;
    wx.navigateTo({
      url: "../group_info/group_info?course_id=" + temp,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    var that = this;
    wx.request({
      url: 'http://jihanyang.cn:8080/get_course',
      data: {
        course_id: option.course_id
      },
      method: 'GET',
      success: function (res) {
        if (res.data == "Cannot find this course") { }
        else {
          that.setData({
            course_id: option.course_id,
            name: res.data.name,
            course_info: res.data.course_info,
            team_ids: res.data.team_ids
          })
          // 当前课程的组队信息
          var team_list_ids = that.data.team_ids.split('@')
          // 对每个team_id不断向服务器获取具体的team的信息，再push进team_list再setData渲染页面
          if (team_list_ids.length == 1 && team_list_ids[0] == 'None') console.log("该课程还没有任何队伍")
          else {
            for (var i = 0; i < team_list_ids.length; i++) {
              wx.request({
                url: 'http://jihanyang.cn:8080/get_team',
                data: {
                  team_id: team_list_ids[i]
                },
                method: 'GET',
                header: {
                  'content-type': 'application/json'
                },
                // 由于组队信息过长，缩略信息只显示前27位字符
                success: function (res) {
                  var modify = res.data.team_members_id
                  if (modify.length > 27) {
                    modify = modify.substring(0, 26) + '...';
                  }
                  var temp = {
                    team_id: res.data.team_id,
                    team_members_id: modify,
                    max_team: res.data.max_team,
                    available_team: res.data.available_team
                  }

                  that.data.team_list.push(temp)
                  that.setData({
                    'team_list': that.data.team_list
                  })
                },
              })
            }
          }
        }
      },
    })
    // 获取当前老师创建的课程
    wx.request({
      url: 'http://jihanyang.cn:8080/get_user',
      method: 'GET',
      data: {
        student_id: wx.getStorageSync('user_id'),
      },
      success: function (res) {
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
    wx.stopPullDownRefresh();
    wx.redirectTo({
      url: '../teacher_course/teacher_course?course_id=' + this.data.course_id,
    })
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