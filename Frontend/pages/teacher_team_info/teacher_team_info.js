// pages/teacher_team_info/teacher_team_info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    team_id: "",
    team_info: "",
    leader: {},
    team_members: [],
    team_members_id: "",
    max_team: "",
    available_team: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options != null) {
      this.setData({
        team_id: options.team_id
      });
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
            // var temp = {
            //   id: "",
            //   name: "",
            //   avatarUrl: ""
            // };
            // that.data.team_members.push(temp);

            // var j = i - 1;
            // var id = "team_members[" + j + "].id";
            // var name = "team_members[" + j + "].name";
            // var photo = "team_members[" + j + "].avatarUrl";

            // that.setData({
            //   [id]: team_members[i]
            // })

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
    wx.redirectTo({
      url: '../teacher_team_info/teacher_team_info?team_id=' + that.data.team_id,
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