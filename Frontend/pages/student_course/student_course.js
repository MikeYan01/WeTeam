var util = require('../../utils/util.js')

Page({
    // 学生页面的全局变量
    data: {
        hidden_modal: true,  // 弹框是否显示
        newteam_team_info: '',  // 输入框内队伍信息
        newteam_max_num: '',  // 输入框内最大队伍人数
        passed_course_id: '',  // 传递的课程id信息
        // 学生个人信息
        student_info: {
            student_id: '',
            username: '',
            attended_course_ids: ''
        },
        // 课程信息
        course_info: {
            teacher_id: '',
            course_info: '',
            teacher_name: '',
            course_id: '',
            name: '',
            course_time: '',
            start_time: '',
            end_time: '',
            max_team: '',
            min_team: '',
            team_ids: '',
            student_ids: ''
        },
        // 我的队伍信息
        my_team: {
            team_id: '',
            team_leader: '',
            team_info: '',
            team_members_id: '',
            team_members: []
        },
        // 队伍列表
        team_list: []
    },

    // 创建队伍点击事件
    create_team: function () {
        var that = this
        // 如果创建队伍的时间不在start_time和end_time之间则不能创建队伍
        var time = util.formatTime(new Date())
        var date_list = time.split(' ')[0].split('/')
        var date_time = date_list[0] + '-' + date_list[1] + '-' + date_list[2]

        // 如果自身已经加入了队伍，则不可以创建队伍
        // 调用访问课程信息接口，从数据库获取课程信息
        wx.request({
            url: 'http://jihanyang.cn:8080/get_course',
            data: {
                course_id: that.data.course_info.course_id
            },
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data)
                var flag = false
                // 判断课程中的学生id中是否有自己的id
                if (res.data.student_ids != 'None') {
                    var student_ids_dict = JSON.parse(res.data.student_ids)
                    for (var key in student_ids_dict) {
                        if (parseInt(that.data.student_info.student_id) == parseInt(key) && student_ids_dict[key] != '0') {
                            flag = true
                        }
                    }
                }

                // 如果flag = true，则已加入队伍，则不能创建队伍
                if (flag) {
                    console.log("已经加入了队伍，不能创建队伍")
                    wx.showModal({
                        title: '提示',
                        showCancel: false,
                        content: '您已经加入了队伍，不能创建队伍',
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                            }
                        }
                    })
                    // 否则显示弹框可输入队伍信息
                } else if (date_time < that.data.course_info.start_time || date_time > that.data.course_info.end_time) {
                    console.log(date_time)
                    console.log("不在组队开始时间至截止时间内，不可以组队了")
                    wx.showModal({
                        title: '提示',
                        showCancel: false,
                        content: '不在指定时间内组队，不能创建队伍',
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                            }
                        }
                    })
                } else {
                    console.log("创建队伍")
                    that.setData({
                        hidden_modal: false
                    })
                }
            },
            fail: function () {
                console.log("判断是否已加入队伍失败")
            }
        })
    },

    // 输入队伍信息，并保存在newteam_team_info中
    input_typing: function (e) {
        var that = this
        that.setData({
            newteam_team_info: e.detail.value
        })
    },

    // 输入队伍可加入的最大人数，并保存在newteam_max_num中
    input_typing_number: function (e) {
        var that = this
        that.setData({
            newteam_max_num: e.detail.value
        })
    },

    // 点击提交，向服务器post提交新建队伍信息
    modal_confirm: function () {
        var that = this
        if (parseInt(that.data.newteam_max_num) < parseInt(that.data.course_info.min_team) || parseInt(that.data.newteam_max_num) > parseInt(that.data.course_info.max_team)) {
            console.log("输入的最大队伍人数不在课程设置的区间内，不能创建队伍")
            // 弹框提示成功
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '输入的最大队伍人数不在课程设置的区间内，不能创建队伍',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                    }
                }
            })
            return
        }

        // post提交创建队伍信息，将输入框内的所有信息提交到服务器创建队伍
        wx.request({
            url: 'http://jihanyang.cn:8080/add_team',
            data: {
                course_id: that.data.course_info.course_id,
                leader_id: that.data.student_info.student_id,
                team_info: that.data.newteam_team_info,
                max_team: that.data.newteam_max_num,
                available_team: that.data.newteam_max_num - 1 + '',
                team_members_id: that.data.student_info.student_id
            },
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                console.log(res.data)
                // 提示创建成功
                wx.showToast({
                    title: '成功',
                    icon: 'success',
                    duration: 2000,
                })

                // 更新该课程的team_ids，将创建的队伍的id加入到课程的team_ids中
                var new_team_ids = ''
                var team_ids_list = that.data.course_info.team_ids.split('@')
                if (team_ids_list.length == 1 && team_ids_list[0] == 'None') {
                    new_team_ids = res.data.team_id
                } else {
                    team_ids_list.push(res.data.team_id)
                    new_team_ids = team_ids_list.join('@')
                }

                //更改课程中的队伍列表,例如"1@2@3@4",即将更改后的team_ids调用modify_team_ids接口
                wx.request({
                    url: 'http://jihanyang.cn:8080/modify_team_ids',
                    data: {
                        course_id: that.data.course_info.course_id,
                        team_ids: new_team_ids
                    },
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                        console.log(res.data)
                    },
                    fail: function () {
                        console.log("更新该课程的team_ids失败")
                    }
                })

                //更改课程中的学生信息以及其加入的队伍，例如"15330000:0"的JSON格式
                var json_student_ids = {}
                if (that.data.course_info.student_ids == 'None') {
                    json_student_ids[that.data.student_info.student_id] = res.data.team_id
                    json_student_ids = JSON.stringify(json_student_ids)
                } else {
                    var student_to_team = JSON.parse(that.data.course_info.student_ids)
                    student_to_team[that.data.student_info.student_id] = res.data.team_id
                    json_student_ids = JSON.stringify(student_to_team)
                }
                // 并将更改后的json_student_ids将课程的student_ids在服务器发出请求，要求更改
                wx.request({
                    url: 'http://jihanyang.cn:8080/course_modify_student',
                    data: {
                        course_id: that.data.course_info.course_id,
                        student_ids: json_student_ids
                    },
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                        console.log(res.data)
                    },
                    fail: function () {
                        console.log("更改课程中的学生信息以及其加入的队伍失败")
                    }
                })

                // 更新课程页面UI(自己加入的队伍)
                that.data.my_team.team_id = res.data.team_id
                that.data.my_team.team_leader = that.data.student_info.student_id
                that.data.my_team.team_info = res.data.team_info
                that.data.my_team.team_members_id = that.data.student_info.student_id
                that.data.my_team.team_members = []
                that.data.my_team.team_members.push(that.data.student_info.student_id)

                that.setData({
                    'my_team': that.data.my_team
                })

                // 更新课程页面UI(课程所有队伍信息)
                var newTeam = {
                    team_id: res.data.team_id,
                    team_leader: that.data.student_info.student_id,
                    team_info: that.data.newteam_team_info,
                    max_team: that.data.newteam_max_num,
                    available_team: that.data.newteam_max_num - 1 + '',
                    team_members_id: that.data.student_info.student_id
                }
                that.data.team_list.push(newTeam)
                that.setData({
                    team_list: that.data.team_list
                })

                // 清除input并隐藏弹框
                that.setData({
                    hidden_modal: true,
                    newteam_team_info: '',
                    newteam_max_num: ''
                })

                wx.navigateTo({
                    url: '../leader_info/leader_info?teamIndex=' + JSON.stringify(that.data.my_team) + '&course_id=' + that.data.course_info.course_id
                })
            },
            fail: function () {
                console.log("创建新队伍失败")
                // 清除input并隐藏弹框
                that.setData({
                    hidden_modal: true,
                    newteam_team_info: '',
                    newteam_max_num: ''
                })
            }
        })
    },

    // 取消创建队伍，清除input并隐藏弹框
    modal_cancel: function () {
        var that = this
        that.setData({
            hidden_modal: true,
            newteam_team_info: '',
            newteam_max_num: ''
        })
    },

    // 快速加入队伍点击事件
    quick_add: function () {
        var that = this
        // 如果创建队伍的时间不在start_time和end_time之间则不能创建队伍
        var time = util.formatTime(new Date())
        var date_list = time.split(' ')[0].split('/')
        var date_time = date_list[0] + '-' + date_list[1] + '-' + date_list[2]
        // 如果自身已经加入了队伍，则不可以创建队伍
        // 获取课程的所有team，并得到每个team里面的所有student_id
        wx.request({
            url: 'http://jihanyang.cn:8080/get_course',
            data: {
                course_id: that.data.course_info.course_id
            },
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data)
                // 调用get_course接口，通过student_ids来判断这个学生是否加入队伍
                var keys_flag = false
                if (res.data.student_ids != 'None') {
                    var student_ids_dict = JSON.parse(res.data.student_ids)
                    for (var key in student_ids_dict) {
                        if (parseInt(that.data.student_info.student_id) == parseInt(key) && student_ids_dict[key] != '0') {
                            keys_flag = true
                            break
                        }
                    }
                }

                // 如果keys_flag = true，则不能创建队伍
                if (keys_flag) {
                    console.log("已经加入了队伍，不能创建队伍")
                    wx.showModal({
                        title: '提示',
                        showCancel: false,
                        content: '您已经加入了队伍，不能创建队伍',
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                            }
                        }
                    })
                    // 否则显示弹框可输入队伍信息
                } else if (date_time < that.data.course_info.start_time || date_time > that.data.course_info.end_time) {
                    console.log("不在组队开始时间至截止时间内，不可以组队了")
                    wx.showModal({
                        title: '提示',
                        showCancel: false,
                        content: '不在指定时间内组队，不能创建队伍',
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                            }
                        }
                    })
                    // 如果队伍列表中的所有队伍中可加入人数仍>0,则将flag设为false
                } else {
                    var flag = true
                    for (var i = 0; i < that.data.team_list.length; i++) {
                        if (parseInt(that.data.team_list[i].available_team) > 0) {
                            flag = false
                        }
                    }

                    // 如果flag为true，则说明所有的队伍都已满员，不能加入
                    if (flag) {
                        console.log("所有队伍已满员，不能加入任何队伍")
                        wx.showModal({
                            title: '提示',
                            content: '所有队伍已满员，不能加入任何队伍',
                            success: function (res) {
                                if (res.confirm) {
                                    console.log('用户点击确定')
                                } else if (res.cancel) {
                                    console.log('用户点击取消')
                                }
                            }
                        })
                        return
                    }



                    // 随机在队伍列表中选取一个队伍，但要保证该队伍还有空位
                    var index = Math.floor(Math.random() * that.data.team_list.length)
                    while (parseInt(that.data.team_list[index].available_team) == 0) {
                        index = Math.floor(Math.random() * that.data.team_list.length)
                    }
                    // 向服务器post请求更改选取的队伍的队员信息，可加入人数信息
                    wx.request({
                        url: 'http://jihanyang.cn:8080/modify_team',
                        data: {
                            team_id: that.data.team_list[index].team_id,
                            leader_id: 'None',
                            team_members_id: that.data.team_list[index].team_members_id + "@" + that.data.student_info.student_id
                        },
                        method: 'POST',
                        header: {
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        success: function (res) {
                            console.log(res.data)
                            wx.showToast({
                                title: '成功',
                                icon: 'success',
                                duration: 2000,
                            })

                            //更改课程中的学生信息以及其加入的队伍，例如"15330000:0"的JSON格式
                            var json_student_ids = {}
                            if (that.data.course_info.student_ids == 'None') {
                                json_student_ids[that.data.student_info.student_id] = res.data.team_id
                                json_student_ids = JSON.stringify(json_student_ids)
                            } else {
                                var student_to_team = JSON.parse(that.data.course_info.student_ids)
                                student_to_team[that.data.student_info.student_id] = res.data.team_id
                                json_student_ids = JSON.stringify(student_to_team)
                            }
                            // 并将更改后的student_ids向服务器提出请求，更改课程的student_ids
                            wx.request({
                                url: 'http://jihanyang.cn:8080/course_modify_student',
                                data: {
                                    course_id: that.data.course_info.course_id,
                                    student_ids: json_student_ids
                                },
                                method: 'POST',
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded'
                                },
                                success: function (res) {
                                    console.log(res.data)
                                },
                                fail: function () {
                                    console.log("更改课程中的学生信息以及其加入的队伍失败")
                                }
                            })

                            // 更新课程页面UI(自身队伍信息)
                            that.data.my_team.team_id = that.data.team_list[index].team_id
                            that.data.my_team.team_leader = that.data.team_list[index].team_leader
                            that.data.my_team.team_info = that.data.team_list[index].team_info
                            that.data.my_team.team_members_id = that.data.team_list[index].team_members_id
                            var team_members_id_list = that.data.team_list[index].team_members_id.split('@')
                            that.data.my_team.team_members = []
                            for (var i = 0; i < team_members_id_list.length; i++) {
                                that.data.my_team.team_members.push(team_members_id_list[i])
                            }
                            that.data.my_team.team_members.push(that.data.student_info.student_id)

                            that.setData({
                                my_team: that.data.my_team
                            })

                            // 更新课程页面UI(课程所有队伍信息)
                            that.data.team_list[index].available_team = that.data.team_list[index].available_team - 1 + ''
                            that.data.team_list[index].team_members_id = that.data.team_list[index].team_members_id + "@" + that.data.student_info.student_id

                            that.setData({
                                team_list: that.data.team_list
                            })
                            var flag = true
                            // 跳转至队伍信息页面
                            wx.navigateTo({
                              url: '../team_info/team_info?teamIndex=' + JSON.stringify(that.data.my_team) + "&hasJoin=" + flag + "&course_id=" + that.data.course_info.course_id,
                            })
                        },
                        fail: function () {
                            console.log("快速加入队伍失败")
                        }
                    })
                }
            },
            fail: function () {
                console.log("判断是否已加入队伍失败")
            }
        })
    },

    // 退出课程操作
    quit_course: function () {
        var that = this
        wx.showModal({
            title: '提示',
            content: '请问您是否要退出该课程',
            success: function (res) {
                if (res.confirm) {
                    console.log('用户确定退出该课程')
                    // 如果学生已经加入了某个队伍，则需要先退出该队伍
                    // 具体操作为post请求服务器更改队伍的具体信息
                    wx.request({
                        url: 'http://jihanyang.cn:8080/get_course',
                        data: {
                            course_id: that.data.course_info.course_id
                        },
                        method: 'GET',
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function (res) {
                            console.log(res.data)
                            // 判断该学生是否已经加入了队伍，否则要对队伍进行操作
                            var keys_flag = false
                            var get_team_id = ''
                            if (res.data.student_ids != 'None') {
                                var student_ids_dict = JSON.parse(res.data.student_ids)
                                for (var key in student_ids_dict) {
                                    if (parseInt(that.data.student_info.student_id) == parseInt(key) && student_ids_dict[key] != '0') {
                                        keys_flag = true
                                        get_team_id = student_ids_dict[key]
                                        break
                                    }
                                }
                            }
                            if (keys_flag) {
                                // 判断是否为队长，若为队长，则更改队长并退出队伍
                                wx.request({
                                    url: 'http://jihanyang.cn:8080/get_team',
                                    data: {
                                        team_id: get_team_id
                                    },
                                    method: 'GET',
                                    header: {
                                        'content-type': 'application/json'
                                    },
                                    success: function (res) {
                                        console.log(res.data)
                                        // 判断是否为队长，如果是队长需要将队长转移为队伍内下一个人
                                        var members = res.data.team_members_id.split('@')
                                        var change_leader = ''
                                        var leader = res.data.leader_id
                                        if (members.length == 1) {
                                            change_leader = 'None'
                                        } else {
                                            for (var j = 0; j < members.length; j++) {
                                                if (members[j] != that.data.student_info.student_id) {
                                                    change_leader = members[j]
                                                    break
                                                }
                                            }
                                        }

                                        // 如果为队长，转让队长，通过POST请求更改队伍的信息
                                        if (parseInt(leader) == parseInt(that.data.student_info.student_id)) {
                                            wx.request({
                                                url: 'http://jihanyang.cn:8080/modify_team',
                                                data: {
                                                    team_id: get_team_id,
                                                    leader_id: change_leader
                                                },
                                                method: 'POST',
                                                header: {
                                                    'content-type': 'application/json'
                                                },
                                                success: function (res) {
                                                    console.log(res.data)

                                                    // 并退出队伍
                                                    // 具体操作为POST请求到服务器，在课程中更改学生的信息，具体为学生的attended_ids
                                                    var attended_id = wx.getStorageSync('attended_id')
                                                    var course_ids = attended_id.split('@')
                                                    var deleted_course = ''
                                                    if (course_ids.length == 1) {
                                                        deleted_course = 'None'
                                                    } else {
                                                        var deleted_index = course_ids.indexOf(that.data.course_info.course_id)
                                                        course_ids.splice(deleted_index, 1)
                                                        deleted_course = course_ids.join('@')
                                                    }

                                                    // 更改该课程的学生和对应的队伍信息，具体为course的student_ids
                                                    var json_student_ids = {}
                                                    if (that.data.course_info.student_ids == 'None') {
                                                        json_student_ids[that.data.student_info.student_id] = "0"
                                                        json_student_ids = JSON.stringify(json_student_ids)
                                                    } else {
                                                        var student_to_team = JSON.parse(that.data.course_info.student_ids)
                                                        student_to_team[that.data.student_info.student_id] = "0"
                                                        json_student_ids = JSON.stringify(student_to_team)
                                                    }
                                                    // 向服务器发出POST请求更改课程已加入的学生，即student_ids
                                                    wx.request({
                                                        url: 'http://jihanyang.cn:8080/course_modify_student',
                                                        data: {
                                                            course_id: that.data.course_info.course_id,
                                                            student_ids: json_student_ids
                                                        },
                                                        method: 'POST',
                                                        header: {
                                                            'content-type': 'application/x-www-form-urlencoded'
                                                        },
                                                        success: function (res) {
                                                            console.log(res.data)
                                                        },
                                                        fail: function () {
                                                            console.log("更改课程中的学生信息以及其加入的队伍失败")
                                                        }
                                                    })

                                                    // 更改学生已加入的课程信息，即通过POST请求更改学生的attended_course_ids
                                                    wx.request({
                                                        url: 'http://jihanyang.cn:8080/modify_attended_course',
                                                        data: {
                                                            student_id: that.data.student_info.student_id,
                                                            attended_course_ids: deleted_course
                                                        },
                                                        method: 'POST',
                                                        header: {
                                                            'content-type': 'application/x-www-form-urlencoded'
                                                        },
                                                        success: function (res) {
                                                            console.log(res.data)
                                                            // 回到学生主页页面
                                                            wx.redirectTo({
                                                                url: '../student_index/student_index',
                                                            })
                                                        },
                                                        fail: function () {
                                                            console.log("退出课程失败")
                                                        }
                                                    })
                                                },
                                                fail: function () {
                                                    console.log("队长退出队伍失败")
                                                }
                                            })
                                        } else {
                                            // 否则只是退出队伍
                                            // 删除我的队伍中的team_members_id列表中含有我的学号
                                            var team_members_id_list = members
                                            var deleted_index = team_members_id_list.indexOf(that.data.student_info.student_id)
                                            team_members_id_list.splice(deleted_index, 1)
                                            team_members_id_list = team_members_id_list.join('@')
                                            // 通过POST请求更改队伍内的team_members_id
                                            wx.request({
                                                url: 'http://jihanyang.cn:8080/modify_team',
                                                data: {
                                                    team_id: get_team_id,
                                                    team_members_id: team_members_id_list
                                                },
                                                method: 'POST',
                                                header: {
                                                    'content-type': 'application/x-www-form-urlencoded'
                                                },
                                                success: function (res) {
                                                    console.log(res.data)

                                                    // 并退出队伍
                                                    // 具体操作为POST请求到服务器，在课程中更改学生的信息
                                                    var attended_id = wx.getStorageSync('attended_id')
                                                    var course_ids = attended_id.split('@')
                                                    var deleted_course = ''
                                                    if (course_ids.length == 1) {
                                                        deleted_course = 'None'
                                                    } else {
                                                        var deleted_index = course_ids.indexOf(that.data.course_info.course_id)
                                                        course_ids.splice(deleted_index, 1)
                                                        deleted_course = course_ids.join('@')
                                                    }

                                                    // 更改学生的已加入课程信息，即通过POST请求更改学生的attended_course_ids
                                                    wx.request({
                                                        url: 'http://jihanyang.cn:8080/modify_attended_course',
                                                        data: {
                                                            student_id: that.data.student_info.student_id,
                                                            attended_course_ids: deleted_course
                                                        },
                                                        method: 'POST',
                                                        header: {
                                                            'content-type': 'application/x-www-form-urlencoded'
                                                        },
                                                        success: function (res) {
                                                            console.log(res.data)
                                                            // 回到学生主页页面
                                                            wx.redirectTo({
                                                                url: '../student_index/student_index',
                                                            })
                                                        },
                                                        fail: function () {
                                                            console.log("退出课程失败")
                                                        }
                                                    })

                                                    // 更改课程的学生和对应的队伍信息
                                                    var json_student_ids = {}
                                                    if (that.data.course_info.student_ids == 'None') {
                                                        json_student_ids[that.data.student_info.student_id] = "0"
                                                        json_student_ids = JSON.stringify(json_student_ids)
                                                    } else {
                                                        var student_to_team = JSON.parse(that.data.course_info.student_ids)
                                                        student_to_team[that.data.student_info.student_id] = "0"
                                                        json_student_ids = JSON.stringify(student_to_team)
                                                    }
                                                    // 通过POST请求更改课程的已加入学生的student_ids
                                                    wx.request({
                                                        url: 'http://jihanyang.cn:8080/course_modify_student',
                                                        data: {
                                                            course_id: that.data.course_info.course_id,
                                                            student_ids: json_student_ids
                                                        },
                                                        method: 'POST',
                                                        header: {
                                                            'content-type': 'application/x-www-form-urlencoded'
                                                        },
                                                        success: function (res) {
                                                            console.log(res.data)
                                                        },
                                                        fail: function () {
                                                            console.log("更改课程中的学生信息以及其加入的队伍失败")
                                                        }
                                                    })
                                                },
                                                fail: function () {
                                                    console.log("退出队伍失败")
                                                }
                                            })
                                        }
                                    }
                                })

                            } else {
                                // 退出了队伍之后，接着退出该课程
                                // 具体操作为POST请求到服务器，在课程中更改学生的信息
                                var attended_id = wx.getStorageSync('attended_id')
                                var course_ids = attended_id.split('@')
                                var deleted_course = ''
                                if (course_ids.length == 1) {
                                    deleted_course = 'None'
                                } else {
                                    var deleted_index = course_ids.indexOf(that.data.course_info.course_id)
                                    course_ids.splice(deleted_index, 1)
                                    deleted_course = course_ids.join('@')
                                }

                                // 更改学生的已加入队伍的信息，但不需要更改课程的学生对应队伍信息，因为没有加入队伍
                                // 通过POST请求更改学生的attended_course_ids
                                wx.request({
                                    url: 'http://jihanyang.cn:8080/modify_attended_course',
                                    data: {
                                        student_id: that.data.student_info.student_id,
                                        attended_course_ids: deleted_course
                                    },
                                    method: 'POST',
                                    header: {
                                        'content-type': 'application/x-www-form-urlencoded'
                                    },
                                    success: function (res) {
                                        console.log(res.data)
                                        // 回到学生主页页面
                                        wx.redirectTo({
                                            url: '../student_index/student_index',
                                        })
                                    },
                                    fail: function () {
                                        console.log("退出课程失败")
                                    }
                                })
                            }
                            var student_ids_temp = JSON.parse(res.data.student_ids)
                            var counter = 0
                            for (var key in student_ids_temp) {
                                counter = counter + 1
                                if (parseInt(that.data.student_info.student_id) == parseInt(key)) {
                                    delete student_ids_temp[key]
                                }
                            }
                            if (counter == 1) {
                                student_ids_temp = "None"
                            }
                            // 通过POST请求并更改该课程的已加入的student_ids
                            wx.request({
                                url: 'http://jihanyang.cn:8080/course_modify_student',
                                data: {
                                    course_id: that.data.course_info.course_id,
                                    student_ids: JSON.stringify(student_ids_temp)
                                },
                                method: 'POST',
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded'
                                },
                                success: function (res) {
                                    console.log(res.data)
                                },
                                fail: function () {
                                    console.log("更改course的student_ids字段失败")
                                }
                            })
                        },
                        fail: function () {
                            console.log("用户退出课程失败")
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },

    // 点击进入自己的队伍页面
    check_myteam: function (e) {
      var that = this
      var flag = true
      if (that.data.my_team.team_id != "") {
          if(that.data.my_team.team_leader == that.data.student_info.student_id) {
            // 如果为队长则跳转至队长页面
            wx.navigateTo({
              url: "../leader_info/leader_info?teamIndex=" + JSON.stringify(that.data.my_team) + "&course_id=" + that.data.course_info.course_id
            })
          } else {
            // 如果为队员则跳转至队员页面
            wx.navigateTo({
              url: "../team_info/team_info?teamIndex=" + JSON.stringify(that.data.my_team) + "&hasJoin=" + flag + "&course_id=" + that.data.course_info.course_id
            })
          }
      } else {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '您还没有加入队伍，不能查看您的队伍信息',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
      }
    },

    // 点击进入某一个队伍的详情的事件触发函数
    join_team: function (e) {
        var that = this
        console.log("当前索引为 " + e.currentTarget.dataset.index)
        // 通过GET请求获取该课程的所有student_ids信息
        wx.request({
            url: 'http://jihanyang.cn:8080/get_course',
            data: {
                course_id: that.data.course_info.course_id
            },
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data)
                // 如果student_ids有我的id，则说明我已经加入了队伍
                var flag = false
                var get_my_team = ''
                if (res.data.student_ids != 'None') {
                    var student_ids_dict = JSON.parse(res.data.student_ids)
                    for (var key in student_ids_dict) {
                        if (parseInt(that.data.student_info.student_id) == parseInt(key) && student_ids_dict[key] == that.data.team_list[e.currentTarget.dataset.index].team_id) {
                            flag = true
                            get_my_team = student_ids_dict[key]
                            break
                        }
                    }
                }
                console.log(flag)
                // 如果flag = true，则已加入自己点击的队伍，则不能创建队伍
                if (flag) {
                    wx.request({
                        url: 'http://jihanyang.cn:8080/get_team',
                        data: {
                            team_id: get_my_team
                        },
                        method: 'GET',
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function (res) {
                            console.log(res.data)
                            if (res.data.leader_id == that.data.student_info.student_id) {
                                wx.navigateTo({
                                // 如果为队长则跳转至队长页面
                                    url: "../leader_info/leader_info?teamIndex=" + JSON.stringify(that.data.team_list[e.currentTarget.dataset.index]) + "&course_id=" + that.data.course_info.course_id
                                })
                            } else {
                                wx.navigateTo({
                                // 如果为队员则跳转至队员页面
                                    url: "../team_info/team_info?teamIndex=" + JSON.stringify(that.data.team_list[e.currentTarget.dataset.index]) + "&hasJoin=" + flag + "&course_id=" + that.data.course_info.course_id
                                })
                            }
                        },
                        fail: function () {
                            console.log("获取具体队伍信息失败")
                        }
                    })
                } else {
                    console.log("该学生在该课程中没有加入任何队伍")
                    wx.navigateTo({
                        url: "../team_info/team_info?teamIndex=" + JSON.stringify(that.data.team_list[e.currentTarget.dataset.index]) + "&hasJoin=" + flag + "&course_id=" + that.data.course_info.course_id
                    })
                }
            },
            fail: function () {
                console.log("获取自身队伍加载页面失败")
            }
        })
    },

    // 初始化渲染页面
    onLoad: function (options) {
        console.log(options.courseIndex)
        var that = this
        // 从本地缓存中获取学生学号和姓名
        var user_id = wx.getStorageSync('user_id')
        var username = wx.getStorageSync('username')
        that.setData({
            'student_info.student_id': user_id,
            'student_info.username': username,
        })

        // 从学生主页点击的课程信息的参数传递到课程主页中，从而获取课程信息
        that.setData({
            passed_course_id: JSON.parse(options.courseIndex)
        })
        wx.request({
            url: 'http://jihanyang.cn:8080/get_course',
            data: {
                course_id: that.data.passed_course_id
            },
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data)
                that.setData({
                    'course_info.teacher_id': res.data.teacher_id,
                    'course_info.course_id': res.data.course_id,
                    'course_info.name': res.data.name,
                    'course_info.course_time': res.data.course_time,
                    'course_info.course_info': res.data.course_info,
                    'course_info.start_time': res.data.start_time,
                    'course_info.end_time': res.data.end_time,
                    'course_info.max_team': res.data.max_team,
                    'course_info.min_team': res.data.min_team,
                    'course_info.team_ids': res.data.team_ids,
                })

                wx.request({
                    url: 'http://jihanyang.cn:8080/get_user',
                    data: {
                        student_id: res.data.teacher_id
                    },
                    method: 'GET',
                    header: {
                        'content-type': 'application/json'
                    },
                    success: function (res) {
                        console.log(res.data)
                        that.setData({
                            'course_info.teacher_name': res.data.username
                        })
                    },
                    fail: function () {
                        console.log("fail to get the teacher name")
                    }
                })

                // 获取当前课程的所有队伍信息
                // 先让team_list列表为空
                that.setData({
                    'team_list': []
                })
                var team_list_ids = res.data.team_ids.split('@')
                // 对每个team_id不断向服务器获取具体的team的信息，再push进team_list再setData渲染页面
                if (team_list_ids.length == 1 && team_list_ids[0] == 'None') {
                    console.log("该课程还没有任何队伍")
                } else {
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
                                console.log(res.data)
                                var temp = {
                                    team_id: res.data.team_id,
                                    team_leader: res.data.leader_id,
                                    team_info: res.data.team_info,
                                    max_team: res.data.max_team,
                                    available_team: res.data.available_team,
                                    team_members_id: res.data.team_members_id
                                }
                                that.data.team_list.push(temp)
                                that.setData({
                                    'team_list': that.data.team_list
                                })
                            },
                        })
                    }
                }
            },
            fail: function () {
                console.log("fail to get the selected course info")
            }
        })

        // 获取当前学生的attended_course_ids，若该学生未加入该课程，则需要修改attended_course_ids
        var attended_id = wx.getStorageSync('attended_id')
        var course_ids = attended_id.split('@')
        var attended_flag = false
        for (var i = 0; i < course_ids.length; i++) {
            if (parseInt(course_ids[i]) == parseInt(that.data.passed_course_id)) attended_flag = true
        }
        if (attended_flag == false) {
            // 向服务器提出修改attended_course_ids请求
            console.log("学生未加入该课程，需要更改attended_course_ids")
            var new_course_ids = ''
            if (course_ids.length == 1 && course_ids[0] == 'None') {
                new_course_ids = that.data.passed_course_id
            } else {
                course_ids.push(that.data.passed_course_id)
                new_course_ids = course_ids.join('@')
            }
            // 修改用户的attended_course
            wx.request({
                url: 'http://jihanyang.cn:8080/modify_attended_course',
                data: {
                    student_id: that.data.student_info.student_id,
                    attended_course_ids: new_course_ids
                },
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    console.log(res.data)
                    // 同时保存到本地缓存中
                    wx.setStorageSync('attended_id', new_course_ids + "")
                },
                fail: function () {
                    console.log("退出队伍失败")
                }
            })
        } else {
            console.log("学生已加入该课程，不需要更改attended_course_ids")
        }

        // 从本地缓存中获取学生自身的队伍信息
        wx.request({
            url: 'http://jihanyang.cn:8080/get_course',
            data: {
                course_id: that.data.passed_course_id
            },
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data)
                // 保存student_ids
                that.setData({
                    'course_info.student_ids': res.data.student_ids
                })

                var student_ids_temp = {}
                if (attended_flag == false) {
                    if (res.data.student_ids == 'None') {
                        // 在course里面增加student_ids该用户的字段，value为0
                        student_ids_temp[that.data.student_info.student_id] = "0"
                    } else {
                        student_ids_temp = JSON.parse(res.data.student_ids)
                        student_ids_temp[that.data.student_info.student_id] = "0"
                    }

                    wx.request({
                        url: 'http://jihanyang.cn:8080/course_modify_student',
                        data: {
                            course_id: that.data.passed_course_id,
                            student_ids: JSON.stringify(student_ids_temp)
                        },
                        method: 'POST',
                        header: {
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        success: function (res) {
                            console.log(res.data)
                        },
                        fail: function () {
                            console.log("更改course的student_ids字段失败")
                        }
                    })
                }

                // 判断student_ids字段是否为None
                var flag = false
                var get_my_team = ''
                if (res.data.student_ids != 'None') {
                    var student_ids_dict = JSON.parse(res.data.student_ids)
                    for (var key in student_ids_dict) {
                        if (parseInt(that.data.student_info.student_id) == parseInt(key) && student_ids_dict[key] != '0') {
                            flag = true
                            get_my_team = student_ids_dict[key]
                            break
                        }
                    }
                }

                // 如果flag = true，则说明已加入了队伍
                if (flag) {
                    wx.request({
                        url: 'http://jihanyang.cn:8080/get_team',
                        data: {
                            team_id: get_my_team
                        },
                        method: 'GET',
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function (res) {
                            console.log(res.data)
                            that.setData({
                                'my_team.team_id': res.data.team_id,
                                'my_team.team_leader': res.data.leader_id,
                                'my_team.team_info': res.data.team_info,
                                'my_team.team_members_id': res.data.team_members_id,
                                'my_team.team_members': res.data.team_members_id.split('@')
                            })
                        },
                        fail: function () {
                            console.log("获取具体队伍信息失败")
                        }
                    })
                } else {
                    console.log("该学生在该课程中没有加入任何队伍")
                }
            },
            fail: function () {
                console.log("获取自身队伍加载页面失败")
            }
        })
    },

    onPullDownRefresh: function () {
      var that = this
        wx.redirectTo({
            url: "../student_course/student_course?courseIndex=" + JSON.stringify(that.data.passed_course_id)
        })
        wx.stopPullDownRefresh()
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