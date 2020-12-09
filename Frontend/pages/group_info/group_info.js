// group_info.js
Page({
  data: {
    team_list: [],
    course_id: '',
    name: '',
    course_info: '',
    max_team: '',
    attended_course_ids: '',
    team_ids: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // 这一部分直接调用student_course中的相同代码即可
  onLoad: function (option) {
    var that = this;
    wx.request({
      url: 'http://jihanyang.cn:8080/get_course',
      data: {
        course_id: option.course_id
      },
      method: 'GET',
      success: function (res) {
        // 获取课程相关信息
        if (res.data == "Cannot find this course") { }
        else {
          that.setData({
            course_id: option.course_id,
            name: res.data.name,
            course_info: res.data.course_info,
            team_ids: res.data.team_ids
          })

          var team_list_ids = that.data.team_ids.split('@')
          // 对每个team_id不断向服务器获取具体的team的信息，再push进team_list再setData渲染页面
          if (team_list_ids.length == 1 && team_list_ids[0] == 'None') {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '当前课程无队伍！',
              success: function() {
                wx.navigateBack({
                  url: "../teacher_course/teacher_course",
                })
              }
            })
          }
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
                success: function (res) {
                  var modify = res.data.team_members_id
                  if (modify.length > 27) {
                    modify = modify.substring(0, 26) + '...';
                  }
                  var temp = {
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