// pages/search/search.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchData: '',    // 存储搜索框内的输入的数据
        course_list: [/*{  // 存储搜索页面显示的课程列表，列表中的元素为一个对象
            teacher_id: '',
            teacher_name: '衣杨',
            course_id: '',
            name: '系统分析与设计',
            course_info: '',
            course_time: '星期一5-6节/星期三5-6节',
            start_time: '2018/04/01',
            end_time: '2018/05/01',
            max_team: '',
            min_team: '',
            team_ids: '',

        }*/]
    },

    // 点击搜索页面内的课程的点击触发事件
    check_course: function (e) {
        var that = this
        console.log("当前索引为 " + e.currentTarget.dataset.index)
        // 弹框请求是否加入该课程
        wx.showModal({
            title: '提示',
            content: '请问您是否要加入该课程',
            success: function (res) {
                if (res.confirm) {
                    // 跳转至学生课程页面
                    wx.navigateTo({
                        url: "../student_course/student_course?courseIndex=" + JSON.stringify(that.data.course_list[e.currentTarget.dataset.index].course_id)
                    })
                } else if (res.cancel) {
                    console.log('用户取消加入该课程')
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        // 获取本地缓存中用户在搜索框输入的内容
        var search_data = wx.getStorageSync('searchData')
        // 存储在本地变量中
        that.setData({
            'searchData': search_data.searchData,
        })
        // 对之前学生主页输入的搜索信息对数据库发出查询课程的请求
        wx.request({
            url: 'http://jihanyang.cn:8080/get_course',
            data: {
                name: that.data.searchData
            },
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data)
                // 清空课程列表
                that.setData({
                    course_list: []
                })
                // 将搜索到的课程数据一个个存入一个对象中并存储在课程列表中
                for (var i = 0; i < res.data.length; i++) {
                    var course_obj = {
                        teacher_id: res.data[i].teacher_id,
                        teacher_name: res.data[i].teacher_name,
                        course_info: res.data[i].course_info,
                        course_id: res.data[i].course_id,
                        name: res.data[i].name,
                        course_time: res.data[i].course_time,
                        start_time: res.data[i].start_time,
                        end_time: res.data[i].end_time,
                        max_team: res.data[i].max_team,
                        min_team: res.data[i].min_team,
                        team_ids: res.data[i].team_ids
                    }

                    // 根据教师的id获取教师的姓名
                    /*wx.request({
                        url: 'http://jihanyang.cn:8080/get_user',
                        data: { student_id: course_obj.teacher_id },
                        method: 'GET',
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function (res) {
                            if (res.statusCode == 200) {
                                console.log(res.data)
                                course_obj.teacher_name = res.data.username

                            } else {
                                console.log("错误的状态码 " + res.statusCode)
                            }
                        },
                        fail: function () {
                            console.log("获取任课老师姓名失败")
                        }
                    })*/
                    that.data.course_list.push(course_obj)

                    // 更新页面UI课程列表
                    that.setData({
                        'course_list': that.data.course_list
                    })
                }
            },
            fail: function () {
                console.log("获取搜索课程列表失败")
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