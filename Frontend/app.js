//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    wx.checkSession({
      success: function(e) {
        console.log("没过期");
        console.log(wx.getStorageSync('third_session_key'))
        wx.navigateTo({
          url: '../student_index/student_index',
        })
        wx.getUserInfo({
          success: function (e) {
            var encryptedData_ = e.encryptedData
            var iv_ = e.iv
            wx.request({
              url: 'http://jihanyang.cn:8080/get_decrypted_data',
              data: {
                third_session_key: wx.getStorageSync('third_session_key'),
                encryptedData: encryptedData_,
                iv: iv_
              },
              method: 'POST',
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              success: function (res) {
                console.log(res.data)
              }
            })
          }
        })
      },
      fail: function() {
        console.log("过期了");
        wx.login({
          success: function(res) {
            console.log("wxlogin succeeded........");
            var code_ = res.code;
            
            wx.request({
              url: 'http://jihanyang.cn:8080/get_third_session_key',
              data: {
                code: code_
              },
              method: 'POST',
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              success: function (res) {
                console.log(res.data)
                wx.setStorageSync('third_session_key', res.data);
                wx.getUserInfo({
                  success: function (e) {
                    var encryptedData_ = e.encryptedData
                    var iv_ = e.iv
                    wx.request({
                      url: 'http://jihanyang.cn:8080/get_decrypted_data',
                      data: {
                        third_session_key: wx.getStorageSync('third_session_key'),
                        encryptedData: encryptedData_,
                        iv: iv_
                      },
                      method: 'POST',
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded"
                      },
                      success: function (res) {
                        console.log(res.data)
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  
  globalData: {
    userInfo: null
  }
})