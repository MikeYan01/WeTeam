// pages/team_info/team_info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    course_id: "",
    team_id: "",
    team_info: "",
    leader: {},
    team_members: [],    
    team_members_id: "",
    quit_member_id: "",
    max_team: "",
    available_team: "",
    hasJoin: "",
    isFull: ""
  },
  
  /*
  加入队伍
  */
  joinTeam: function() {
    var that = this;
    var user_id = wx.getStorageSync('user_id')
    wx.showModal({
      title: '警告',
      content: '真的要加入队伍吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'http://jihanyang.cn:8080/get_course',
            data: {
              course_id: that.data.course_id
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              console.log(res.data)
              console.log(res.data.student_ids != 'None')
              if (res.data.student_ids != 'None') {
                console.log("哇哈哈不为空")
                var student_ids_dict = JSON.parse(res.data.student_ids)
                for (var key in student_ids_dict) {
                  console.log(user_id == key)
                  console.log(parseInt(user_id) == parseInt(key))
                  console.log(user_id)
                  console.log(key)
                  if (parseInt(user_id) == parseInt(key)) {
                    if (student_ids_dict[key] != '0') {
                      console.log("已加入队伍")
                      wx.showModal({
                        title: '提示',
                        content: '你已加入过队伍，请先退出你的队伍！',
                        showCancel: false,
                        success: function (res) {
                          if (res.confirm) {
                            wx.navigateTo({
                              url: '../student_course/student_course?courseIndex=' + JSON.stringify(that.data.course_id)
                            })
                          }
                        }
                      })
                    } else {
                      console.log("未加入队伍")
                      student_ids_dict[user_id] = that.data.team_id
                      var update_student_ids = JSON.stringify(student_ids_dict)
                      wx.request({
                        url: 'http://jihanyang.cn:8080/course_modify_student',
                        method: 'POST',
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded"
                        },
                        data: {
                          course_id: that.data.course_id,
                          student_ids: update_student_ids
                        },
                        success: function () { }
                      })

                      var all_team = that.data.team_members_id.split("@")
                      all_team.push(user_id)
                      var update = all_team.join("@")
                      that.setData({
                        team_members_id: update
                      })
                      console.log(that.data.team_id)
                      console.log(update)
                      wx.request({
                        url: 'http://jihanyang.cn:8080/modify_team',
                        method: 'POST',
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded"
                        },
                        data: {
                          team_id: that.data.team_id,
                          leader_id: "None",
                          team_members_id: update
                        },
                        success: function () {
                          wx.showModal({
                            title: '提示',
                            content: '加入队伍成功',
                            showCancel: false,
                            success: function (res) {
                              if (res.confirm) {
                                wx.navigateTo({
                                  url: '../student_course/student_course?courseIndex='+ JSON.stringify(that.data.course_id)
                                })
                              }
                            }
                          })
                        }
                      }) 
                    }
                    break                     
                  }      
                }
              }
            }
          })
        }
      }
    })
  },

  /*
  退出队伍
  */
  quitTeam: function() {
    var that = this;
    var user_id = wx.getStorageSync('user_id')

    wx.showModal({
      title: '警告',
      content: '真的要退出队伍吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'http://jihanyang.cn:8080/get_course',
            data: {
              course_id: that.data.course_id
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              console.log(res.data)
              if (res.data.student_ids != 'None') {
                var student_ids_dict = JSON.parse(res.data.student_ids)
                for (var key in student_ids_dict) {
                  if (parseInt(user_id) == parseInt(key)) {
                    if (student_ids_dict[key] == that.data.team_id) {

                      student_ids_dict[user_id] = 0
                      var update_student_ids = JSON.stringify(student_ids_dict)
                      wx.request({
                        url: 'http://jihanyang.cn:8080/course_modify_student',
                        method: 'POST',
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded"
                        },
                        data: {
                          course_id: that.data.course_id,
                          student_ids: update_student_ids
                        },
                        success: function () { }                      
                      })

                      var all_team = that.data.team_members_id.split("@");
                      var index = all_team.indexOf(user_id);
                      if (index > -1) all_team.splice(index, 1);
                      var update = all_team.join("@");

                      that.setData({
                        team_members_id: update
                      })

                      wx.request({
                        url: 'http://jihanyang.cn:8080/modify_team',
                        method: 'POST',
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded"
                        },
                        data: {
                          team_id: that.data.team_id,
                          leader_id: "None",
                          team_members_id: that.data.team_members_id
                        },
                        success: function () {
                          wx.showModal({
                            title: '提示',
                            content: '退出队伍成功',
                            showCancel: false,
                            success: function (res) {
                              if (res.confirm) {
                                wx.navigateTo({
                                  url: '../student_course/student_course?courseIndex=' + JSON.stringify(that.data.course_id),
                                })
                              }
                            }
                          })
                        }
                      })
                    }
                    break
                  }
                }
              }
            }
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options)
    var team = JSON.parse(options.teamIndex);

    var bool_hasJoin = false
    if (options.hasJoin == "false") bool_hasJoin = false
    else bool_hasJoin = true

    that.setData({
      team_id: team.team_id,
      hasJoin: bool_hasJoin,
      course_id: options.course_id
    })
    console.log(this.data)
    wx.request({
      url: 'http://jihanyang.cn:8080/get_team',
      data: {
        team_id: that.data.team_id
      },
      method: 'GET',
      success: function (res) {
        console.log(res);
        if (res.data == "Cannot find this course") { }
        else {
          that.setData({
            team_info: res.data.team_info,
            max_team: res.data.max_team,
            available_team: res.data.available_team,
            'leader.id': res.data.leader_id,
            team_members_id: res.data.team_members_id
          })
          //判断队伍是否已经满员
          if (that.data.available_team <= 0) {
            that.setData({
              isFull: true
            })
          } else {
            that.setData({
              isFull: false
            })
          }
          wx.request({
            url: 'http://jihanyang.cn:8080/get_user',
            data: {
              student_id: that.data.leader.id
            },
            method: 'GET',
            success: function (res) {
              console.log(res);
              if (res.data == "Cannot find this course") { }
              else {
                that.setData({
                  'leader.name': res.data.username,
                  'leader.avatarUrl': res.data.profile_photo
                })
              }
            }
          })
          console.log(that.data.team_members_id);
          var team_members = that.data.team_members_id.split("@");
          console.log(team_members);
          for (var i = 1; i < team_members.length; i++) {

            wx.request({
              url: 'http://jihanyang.cn:8080/get_user',
              data: {
                student_id: team_members[i]
              },
              method: 'GET',
              success: function (res) {
                console.log(res);
                if (res.data == "Cannot find this course") { }
                else {
                  var temp = {
                    id: res.data.student_id,
                    name: res.data.username,
                    avatarUrl: res.data.profile_photo
                  }
                  that.data.team_members.push(temp)
                  that.setData({
                    team_members: that.data.team_members
                  })
                }
              }
            })            
          }
          console.log(that.data);
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
    var that = this
    var teamIndex = {
      team_id: that.data.team_id
    }
    wx.redirectTo({
      url: '../team_info/team_info?teamIndex=' + JSON.stringify(teamIndex) + "&hasJoin=" + that.data.hasJoin + "&course_id=" + that.data.course_id,
    })
    wx.stopPullDownRefresh();
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