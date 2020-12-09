// pages/leader_info/leader_info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    team_id: "",
    course_id: "",
    team_info: "",
    leader: {},
    team_members: [],
    quit_member_id: "",
    max_team: "",
    available_team: "",
    team_members_id: "",
    clickId: -1,
    hasTapped: false
  },

  chooseMember: function(e) {
    console.log(e);
    var that = this

    that.setData({
      clickId: e.currentTarget.id
    })

    that.setData({
      quit_member_id: e.currentTarget.dataset.id,
      hasTapped: true
    })
    console.log(this.data.quit_member_id);
  },

  deleteMember: function() {
    var that = this;
    var user_id = that.data.quit_member_id;

    wx.showModal({
      title: '警告',
      content: '真的要删除此队友吗',
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
                        success: function() {}
                      })

                      var all_team = that.data.team_members_id.split("@");
                      var index = all_team.indexOf(user_id);
                      if (index > -1) all_team.splice(index, 1);
                      var update = all_team.join("@");

                      that.setData({
                        team_members_id: update
                      })

                      console.log(that.data.team_members_id)
                      console.log(that.data)
                      console.log(that.data.team_members.length)
                      for (var i = 0; i < that.data.team_members.length; i++) {
                        if (that.data.team_members[i].id == user_id) {
                          console.log("找到了")
                          that.data.team_members.splice(i, 1);
                          break;
                        }
                      }

                      console.log(that.data.team_members)

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
                            content: '删除此队友成功',
                            showCancel: false,
                            success: function (res) {
                              if (res.confirm) {
                                that.setData({
                                  hasTapped: false,
                                  quit_member_id: "",
                                  team_members: that.data.team_members
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

  quitTeam: function() {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    var modify_leader_id = (that.data.team_members.length > 0)?that.data.team_members[0].id:"None";
    if(that.data.team_members.length == 0) {
      that.dissolveTeam();
      return;
    }

    wx.showModal({
      title: '警告',
      content: '真的要退队吗',
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
                      
                      for (var i = 0; i < that.data.team_members.length; i++) {
                        if (that.data.team_members[i].id == user_id) {                          
                          that.data.team_members.splice(i, 1);
                          break;
                        }
                      }

                      wx.request({
                        url: 'http://jihanyang.cn:8080/modify_team',
                        method: 'POST',
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded"
                        },
                        data: {
                          team_id: that.data.team_id,
                          leader_id: modify_leader_id,
                          team_members_id: that.data.team_members_id
                        },
                        success: function () {
                          wx.showModal({
                            title: '提示',
                            content: '退队成功',
                            showCancel: false,
                            success: function (res) {
                              if (res.confirm) {
                                wx.navigateTo({
                                  url: '../student_course/student_course?courseIndex=' + JSON.stringify(that.data.course_id)
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

  dissolveTeam: function() {
    var that = this;
    wx.showModal({
      title: '警告',
      content: '真的要解散队伍吗',
      success: function (res) { 
        if (res.confirm) {           
          wx.request({
            url: 'http://jihanyang.cn:8080/delete_team',
            method: 'POST',
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
              team_id: that.data.team_id
            },
            success: function () {
              wx.showModal({
                title: '提示',
                content: '解散队伍成功',
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
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options)
    if (options != null) {
      var team = JSON.parse(options.teamIndex)
      this.setData({
        team_id: team.team_id,
        course_id: options.course_id
      })
    }
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

            console.log(team_members[i])
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
                  // that.setData({
                  //   [name]: res.data.username,
                  //   [photo]: res.data.profile_photo
                  // })
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
      url: '../leader_info/leader_info?teamIndex=' + JSON.stringify(teamIndex) + "&course_id=" + that.data.course_id,
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