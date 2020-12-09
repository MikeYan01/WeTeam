Page({
    // 页面内的全局变量
    data: {
        // 搜索关键字
        search_text: '',
        // 学生信息
        student_info: {
            student_id: '',
            name: '',
            profile_photo: null,
            attended_course_ids: ''
        },
        // 课程信息
        course_list: [/*{
            teacher_id: '',
            course_info: '',
            course_id: '',
            teacher_name: '衣杨',
            name: '系统分析与设计',
            course_time: '星期一5-6节/星期三5-6节',
            start_time: '2018/04/01',
            end_time: '2018/05/01',
            max_team: '',
            min_team: '',
            team_ids: '',
            students_ids: ''
        }*/]
    },

    // 更换头像，并将头像的url地址保存到学生信息中的profile_photo中
    change_avatar: function () {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                var tempFilePaths = res.tempFilePaths
                that.setData({
                    'student_info.profile_photo': tempFilePaths
                })
                // 同时覆盖本地缓存中的头像url地址
                wx.setStorage({
                    key: 'avatarUrl',
                    data: tempFilePaths,
                    success: function (res) {
                        console.log("覆盖存储用户头像url成功")
                    },
                    fail: function () {
                        console.log("覆盖存储用户头像url失败")
                    }
                })
            }
        })
    },

    // 当input内输入内容时，将输入数据赋值给查询的关键字变量
    input_typing: function (e) {
        var that = this
        that.setData({
            search_text: e.detail.value
        })
    },

    // 点击搜索按钮，将跳转到搜索页面search
    navigate_search: function () {
        var that = this
        console.log("搜索的信息 " + that.data.search_text)
        var temp = that.data.search_text.split(" ")
        var temp_obj = {
            searchData: temp[0],
            // courseTime: temp[1]
        }
        wx.setStorageSync('searchData', temp_obj)
        wx.navigateTo({
            url: "../search/search"
        })
    },

    // 点击具体课程，进入该课程的详细信息，即跳转到student_course页面
    check_course: function (e) {
        var that = this
        console.log("当前索引为 " + e.currentTarget.dataset.index)
        wx.navigateTo({
            url: "../student_course/student_course?courseIndex=" + JSON.stringify(that.data.course_list[e.currentTarget.dataset.index].course_id)
        })
    },

    // 当跳转至student_index学生主页时，从数据库以及注册页面获得信息并渲染页面
    onLoad: function (options) {
        console.log('开始进行学生主页的初始化')
        var that = this
        // 获取微信头像并保存在profile_photo中
        wx.getUserInfo({
            success: function (res) {
                that.setData({
                    'student_info.profile_photo': res.userInfo.avatarUrl
                })
            },
            fail: function () {
                console.log("获取头像失败")
            }
        })

        // 从本地缓存中获取姓名，学号(同步)
        var user_id = wx.getStorageSync('user_id')
        var username = wx.getStorageSync('username')
        that.setData({
            'student_info.student_id': user_id,
            'student_info.name': username,
        })

        // 向服务器发送请求从数据库获取用户已加入的课程的id的字符串集合
        wx.request({
            url: 'http://jihanyang.cn:8080/get_user',
            data: { student_id: that.data.student_info.student_id },
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if (res.statusCode == 200) {
                    console.log(res.data)
                    that.setData({
                        'student_info.attended_course_ids': res.data.attended_course_ids
                    })
                    // 同时将学生的已加入课程的id保存到本地缓存中
                    wx.setStorageSync('attended_id', res.data.attended_course_ids + "")
                    var course_ids = (res.data.attended_course_ids).split("@")
                    that.setData({
                        'course_list': []
                    })
                    for (var i = 0; i < course_ids.length; i++) {
                        // 对获取到的course_ids，用一个循环不断请求获取该课程的信息
                        wx.request({
                            url: 'http://jihanyang.cn:8080/get_course',
                            data: { course_id: course_ids[i] },
                            method: 'GET',
                            header: {
                                'content-type': 'application/json'
                            },
                            success: function (res) {
                                if (res.statusCode == 200) {
                                    console.log(res.data)
                                    // 将获取的信息封装成一个对象
                                    var course_obj = {
                                        teacher_id: res.data.teacher_id,
                                        course_info: res.data.course_info,
                                        course_id: res.data.course_id,
                                        name: res.data.name,
                                        course_time: res.data.course_time,
                                        start_time: res.data.start_time,
                                        end_time: res.data.end_time,
                                        max_team: res.data.max_team,
                                        min_team: res.data.min_team,
                                        team_ids: res.data.team_ids,
                                        students_ids: res.data.students_ids
                                    }

                                    // 根据任课老师id从数据库获取教师姓名
                                    wx.request({
                                        url: 'http://jihanyang.cn:8080/get_user',
                                        data: { student_id: res.data.teacher_id },
                                        method: 'GET',
                                        header: {
                                            'content-type': 'application/json'
                                        },
                                        success: function (res) {
                                            if (res.statusCode == 200) {
                                                console.log(res.data)
                                                course_obj.teacher_name = res.data.username
                                                that.data.course_list.push(course_obj)
                                                // 将对象存储至课程列表并进行UI渲染
                                                that.setData({
                                                    'course_list': that.data.course_list
                                                })
                                            } else {
                                                console.log("错误的状态码 " + res.statusCode)
                                            }
                                        },
                                        fail: function () {
                                            console.log("获取任课老师姓名失败")
                                        }
                                    })
                                } else {
                                    console.log("错误的状态码 " + res.statusCode)
                                }
                            },
                            fail: function () {
                                console.log("获取用户课程具体信息失败")
                            }
                        })
                    }
                } else {
                    console.log("错误的状态码 " + res.statusCode)
                }
            },
            fail: function () {
                console.log("获取用户已加入的课程id集合失败")
            }
        })
    },

    onPullDownRefresh: function() {
        wx.redirectTo({
            url: '../student_index/student_index'
        })
        wx.stopPullDownRefresh();
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
})