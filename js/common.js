
Vue.http.headers.common['Content-Type'] = 'application/json';

Vue.http.interceptors.push(function(request, next) {
    request.url += '&oauth_token=6f059c09c8b61818b55c0ac538a4509e&oauth_token_secret=d7278c89981ed5a9476da7056c868f57&language=zh'
    next(function (res){
        return res
    })
    // next(function(res) {
    //     if(res.body.code == 100){
    //         mui.toast("请先登录")
    //         checkApp({
    //             obj: {
    //                 type: 6031,
    //                 data: {}
    //             },
    //             webFn: function (){
    //                 window.location.href = '/buy-mshop/page/member/login.html?callback=' + encodeURIComponent(link);
    //             }
    //         })
    //     }
    //     return res
    // })
})
