//加载更多
var loadMore = '<div class="loadmore" @touchstart="touchstart($event)">\
                    <div class="loadmore-container">\
                        <div class="refresh-text" v-if="refresh" ref="refreshEl">\
                            <span class="refresh-span" v-text="refreshText"></span>\
                        </div>\
                        <slot></slot>\
                        <div v-if="pullRefresh" class="pullRefresh-text" v-text="pullText"></div>\
                    </div>\
                </div>';
Vue.component('loadmore', {
    name: 'loadMore',
    template: loadMore,
    props: [
        'refresh', //下拉刷新
        'pullRefresh', //上拉加载
        'loading',
        'nomore'
    ],
    data: function (){
        return {
            offHeight: 40,
            startY: 0,
            endY: 0,
            winHeight: 0,
            refreshText: '松开刷新',
            pullText: '',
            needRefresh: false,
            scrollType: 1,
        }
    },
    watch: {
        nomore: function (){
            if(this.nomore){
                this.pullText = '没有更多'
            }
        }
    },
    methods: {
        touchstart: function (e){
            this.startY = e.touches[0].clientY;
            var that = this;
            var wrapEl = that.$el;
            var offHeight = that.offHeight;

            var parentEl = wrapEl.parentNode; 
            var scrollEl = parentEl.parentNode;
            var startScrollTop = scrollEl.scrollTop;
            window.ontouchmove = function (e){
                var endY = e.touches[0].clientY;
                var scrollT = parentEl.scrollTop;
                if(!that.loading){
                    if(endY > that.startY){
                        if(scrollT <= 0 && that.refresh){
                            var refreshEl = that.$refs.refreshEl;
                            var offY = endY - that.startY;
                            var y = offY * .5 >= offHeight ? offHeight + 'px' : offY * .5 + 'px';
                            y = y <= 0 ? 0 : y;
                            wrapEl.querySelector(".loadmore-container").style.transform = 'translateY('+ y +')';
                            if(offY * .5 > offHeight) {
                                that.refreshText = '松开刷新'
                                that.needRefresh = true
                            }
                            else{
                                that.refreshText = '下拉刷新'
                                that.needRefresh = false
                            }
                            that.scrollType = 1;
                        }
                    }
                }
                window.ontouchend = function (e){
                    if(that.needRefresh && !that.loading){
                        that.refreshText = '刷新中...';
                        that.needRefresh = false;
                        that.$emit("refresh")
                    }
                    else if(!that.needRefresh && that.scrollType == 1 && that.refresh){
                        that.$el.querySelector(".loadmore-container").style.transform = 'translateY(0)';
                    }
                    window.ontouchmove = null;
                    window.ontouchend = null;
                }
            }
        },
        refreshSuccess: function (){
            this.refreshText = '刷新成功！'
            this.$el.querySelector(".loadmore-container").style.transform = 'translateY(-'+ 0 +')';
        },
        pullSuccess: function (){
            // this.noMore = true
        }
    },
    mounted: function (){
        var winHeight = window.innerHeight;
        this.winHeight = winHeight;
        var that = this;
        var wrapEl = this.$el;
        var parentEl = wrapEl.parentNode; 
        var scrollEl = parentEl.parentNode;
        scrollEl.onscroll = function (e){
            var scrollTop = scrollEl.scrollTop;
            var scrollElHeight = scrollEl.scrollHeight;
            var offHeight = that.offHeight;
            if(scrollTop + that.offHeight + winHeight >= scrollElHeight && !that.nomore && !that.loading) {
                that.pullText = '加载中...';
                that.$emit("pulling");
            }
        }
    }
})

//loaidng
var loadingTemplate = '<div class="loading" v-if="show">\
                            <div class="loading-mast"></div>\
                            <div class="loading-wrap">\
                                <div class="spinner-snake"></div>\
                                <p>加载中...</p>\
                            </div>\
                        </div>';
Vue.component("loading", {
    template: loadingTemplate,
    props: ['show'],
    methods: {
    },
    mounted: function (){
    }
})

//获取验证码
Vue.component("mcode", {
    template: '<a href="javascript:;" :class="className " v-text="isActive ? timeText + \' 秒后重试\' : text" @click="getCode"></a>',
    data: function (){
        return {
            isActive: false,
            timer: null,
            timeText: this.time,
        }
    },
    props:['className','text','time'],
    methods: {
        getCode: function (){
            if(!this.isActive){
                this.$emit('getcode');
            }
        },  
        startTime: function (){
            var time = this.time;
            var that = this;
            this.$el.classList.add("disable");
            this.isActive = true;
            this.timer = setInterval(function (){
                that.timeText --;
                if(that.timeText == "0"){
                    clearInterval(that.timer)
                    that.$el.classList.remove("disable");
                    that.isActive = false;
                    that.timeText = time;
                }
            }, 1000)
        }
    },
    mounted: function (){
    }
})

//地址列表组件
var countryList = [
    {
        countryId: 9001,
        name: '中国'
    },
    {
        countryId: 9005,
        name: '马来西亚'
    }
];

var addressListTemplate = '<div>\
                                <div class="addressContent">\
                                    <div class="address_item" v-for="(item, index) in addressList" @click.stop="selectAddress(item)">\
                                        <div class="address_name_phone clearfix">\
                                            <span v-cloak>{{item.name}}</span>\
                                            <span class="ml10" v-cloak>{{item.mobile}}</span>\
                                        </div>\
                                        <p v-cloak>{{item.area + \' \' + item.address}}</p>\
                                        <div class="address_btn clearfix" @click.prevent.stop>\
                                            <div class="fl address_setdefault">\
                                                <label><input type="checkbox" name="" :checked="item.is_default == 1" @click.prevent="changeDefault(item, index)" class="fl left">设为默认</label>\
                                            </div>\
                                            <div class="fr">\
                                                <span class="btn" @click="showEditPage(item, index)">编辑</span>\
                                                <span class="btn" @click="deleteAddress(item.id, index)">删除</span>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>\
                                <a href="javascript:;" v-if="countryid" class="add_newaddress_btn block" @click="toAddAddress()"></a>\
                                <a href="#popover" v-else class="add_newaddress_btn block"></a>\
                                <div id="popover" class="mui-popover">\
                                    <ul class="mui-table-view">\
                                        <li class="mui-table-view-cell" v-for="item in countryList"><a href="javascript:;" @click="addAddress(item.countryId)">{{item.name}}</a></li>\
                                    </ul>\
                                </div>\
                                <loading :show="isLoading"></loading>\
                                <div class="other-page page-address" :class="{\'active\': showEdit}">\
                                    <div class="header">\
                                        <a href="javascript:;" class="icon icon-arrow-left address_return_btn fl" @click="showEdit = false"></a>\
                                        <h1 class="title">编辑地址</h1>\
                                    </div>\
                                    <edit-address ref="editref" :edit-item-data="editItemData" v-on:changeeditstatus="changeEditStatus" v-on:saveaddress="saveAddress"></edit-address>\
                                </div>\
                            </div>'
Vue.component("address-list", {
    template: addressListTemplate,
    props: ['countryid'],
    data: function (){
        return {
            addressList: [],
            pageIndex: 1,
            isLoading: false,
            countryList: countryList,

            showEdit: false,
            areaList: [],
            editItemData: {},
            editItemIndex: 0,
            checkArea: [],
        }
    },
    mounted: function (){
        console.log(this.countryid)
    },
    created: function (){
        this.getAddressList();
    },
    methods: {
        getAddressList: function (){
            var that = this;
            var sendData = {
                page_index: this.pageIndex,
                page_size: 15,
                countryid: this.countryid
            };
            this.isLoading = true;
            Vue.http.post(jsonUrl + "/api/v1/member/address/list", sendData)
                .then(function (res){
                    that.isLoading = false;
                    that.addressList = res.body.data;
                })
        },
        changeDefault: function (item, index){
            var that = this;
            var sendData = {
                id: item.id,
                countryid: item.countryid
            }
            if(item.is_default == 1){
                return false;
            }
            this.isLoading = true;
            Vue.http.post(jsonUrl + '/api/v1/member/address/changedefault', sendData)
                .then(function (res){
                    that.isLoading = false;
                    mui.toast(res.body.msg)
                    if(res.body.code == 200){
                        that.addressList.forEach(function (country){
                            country.is_default = 0;
                        })
                        Vue.nextTick(function (){
                            item.is_default = 1;
                        })
                    }
                })
        },
        deleteAddress: function (id, index){
            var that = this;
            mui.confirm("确定删除吗？", function (flag){
                if(flag.index == 1){
                    Vue.http.post(jsonUrl + "/api/v1/member/address/remove", {id: id})
                        .then(function (res){
                            mui.toast(res.body.msg)
                            if(res.body.code == 200){
                                that.addressList.splice(index, 1)
                            }
                        })
                }
            })
        },
        addAddress: function (countryId){
            window.location.href = '/buy-mshop/page/member/addAddress.html?countryId=' + countryId
        },
        toAddAddress: function (){
            window.location.href = '/buy-mshop/page/member/addAddress.html?countryId=' + this.countryid + '&callback=' + encodeURIComponent(window.location.href);
        },
        showEditPage: function (item, index){
            var that = this;
            this.editItemIndex = index;
            this.editItemData = item;
            this.isLoading = true;
            this.$nextTick(function (){
                that.$refs.editref.getAreaList(item.countryid);
            })
        },
        changeEditStatus: function(flag){
            if(flag){
                this.isLoading = false;
            }
            this.showEdit = flag;
        },
        saveAddress: function (sendData, areaList){
            var that = this;
            Vue.http.post(jsonUrl + '/api/v1/member/address/edit', sendData)
                .then(function (res){
                    mui.toast(res.body.msg);
                    sendData.area = areaList[0].text + ' ' + areaList[1].text + ' ' + areaList[2].text;
                    that.addressList[that.editItemIndex] = sendData;
                    if(sendData.is_default == 1){
                        var list = that.addressList;
                        list.forEach(function (item){
                            if(item.id != sendData.id){
                                item.is_default = 0;
                            }
                        })
                    }
                    that.showEdit = false;
                })
        },
        selectAddress: function (item){
            this.$emit("selectaddress", item)
        }
    }
})

//编辑地址组件
var editAddressTemplate = '<div class="container">\
                                <form class="mui-input-group">\
                                    <div class="mui-input-row">\
                                        <label>收货人姓名</label>\
                                        <input type="text" class="mui-input-clear" v-model="editItemData.name" placeholder="请输入姓名">\
                                    </div>\
                                </form>\
                                <form class="mui-input-group">\
                                    <div class="mui-input-row">\
                                        <label>手机号码</label>\
                                        <input type="text" class="mui-input-clear" v-model="editItemData.mobile" maxlength="11" placeholder="请输入手机号">\
                                    </div>\
                                </form>\
                                <form class="mui-input-group">\
                                    <div class="mui-input-row noborder">\
                                        <label>选择地区</label> \
                                        <a href="javascript:;" class="fr a-search" @click="changeAreaList()"><span v-text="checkArea.length == 0 ? \'未选择\' : checkAreaText()"></span><span class="arrow-right"></span></a>\
                                    </div>\
                                    <div class="mui-input-row address-area">\
                                        <label>详细地址</label>\
                                        <div class="fr" style="width: 72%">\
                                            <textarea placeholder="请输入详细地址" v-model="editItemData.address"></textarea>\
                                        </div>\
                                    </div>\
                                </form>\
                                <form class="mui-input-group">\
                                    <div class="mui-input-row">\
                                        <label>邮政编码</label>\
                                        <input type="text" class="mui-input-clear" v-model="editItemData.zipcode" placeholder="请输入邮政编码">\
                                    </div>\
                                </form>\
                                <label style="line-height: 30px;">\
                                    <div class="mui-switch mui-switch-mini" id="mySwitch" :class="{\'mui-active\': editItemData.is_default == 1}" @click="editItemData.is_default = editItemData.is_default == 1 ? 0 : 1">\
                                        <div class="mui-switch-handle"></div>\
                                    </div>\
                                    是否设为常用地址\
                                </label>\
                                <div class="add_btn" @click="save()"></div>\
                            </div>';
Vue.component("edit-address", {
    template: editAddressTemplate,
    props: ['editItemData'],
    data: function (){
        return {
            isLoading: false,
            areaList: [],
            checkArea: [],
            picker: null,
        }
    },
    mounted: function (){
        this.picker = new mui.PopPicker({
            layer: 3
        });
    },
    methods: {
        getAreaList: function (countryId){
            var that = this;
            if(!this.areaList[countryId]){
                Vue.http.post(jsonUrl + '/api/v1/common/area/list', {countryid: countryId * 1})
                    .then(function (res){
                        that.areaList[countryId] = res.body.data[0].area;
                        that.setAreaList(res.body.data[0].area);
                        that.$emit('changeeditstatus', true) 
                    })
            }
            else{
                that.setAreaList(this.areaList[countryId])
                that.$emit('changeeditstatus', true) 
            }
        },
        setAreaList: function (list){
            var that = this;
            var areaData = [];
            var editItemData = this.editItemData;
            list.forEach(function (item, i){
                areaData.push({
                    text: item.title,
                    value: item.id,
                    children: [],
                })
                item.sub_area && item.sub_area.forEach(function (child, j){
                    var subSubChild = [];
                    if(child.sub_area){
                        child.sub_area.forEach(function (subChild, k){
                            subSubChild.push({
                                text: subChild.title,
                                value: subChild.id
                            })
                        })
                        areaData[i].children.push({
                            text: child.title,
                            value: child.id,
                            children: subSubChild
                        })
                    }
                })
            })
            this.picker.setData(areaData);
            if(editItemData.province != 0) {
                this.picker.pickers[0].setSelectedValue(editItemData.province,0)
                setTimeout(function (){
                    that.picker.pickers[1].setSelectedValue(editItemData.city,0)
                    setTimeout(function (){
                        that.picker.pickers[2].setSelectedValue(editItemData.district,0)
                        that.checkArea = that.picker.getSelectedItems();
                    }, 0)
                }, 0)
            }
        },
        checkAreaText: function (){
            var list = this.checkArea;
            var text = '';
            list.forEach(function (item){
                text += item.text + ' ';
            })
            return text;
        },
        changeAreaList: function (){
            var that = this;
            this.picker.show(function(SelectedItem) {
                that.checkArea = SelectedItem;
            })
        },
        save: function (){
            var that = this;
            var selectArea = this.checkArea;
            checkNull(that.editItemData.name, '请输入姓名') &&
            checkNull(that.editItemData.mobile, '请输入手机号码') && 
            checkArea() &&
            checkNull(that.editItemData.address, '请输入详细地址')&& 
            checkNull(that.editItemData.zipcode, '请输入邮政编码') && 
            this.editAddress();

            function checkArea() {
                if(that.checkArea.length == 0){
                    mui.toast("请选择地区");
                    return false;
                }
                return true;
            }
            function checkNull(tag, msg){
                if(tag == ''){
                    mui.toast(msg)
                    return false;
                }
                return true;
            }
        },
        editAddress: function (){
            var that = this;
            var areaList = this.checkArea;
            var province = areaList[0].value,
                city = areaList[1].value,
                district = areaList[2] && areaList[2].value;
            var sendData = {
                id: this.editItemData.id,
                countryid: this.editItemData.countryid,
                name: this.editItemData.name,
                mobile: this.editItemData.mobile,
                address: this.editItemData.address,
                zipcode: this.editItemData.zipcode,
                province: province,
                city: city,
                district: district,
                is_default: this.editItemData.is_default ? 1 : 0
            }
            this.$emit("saveaddress", sendData, areaList);
        },
    },
    created: function (){

    },
})