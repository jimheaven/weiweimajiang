
module.exports.allRequist = {

    login:'login',//登录
    StartGame:'StartGame',//开始
    EndGame: 'EndGame',//结束
    CreateRoom: 'CreateRoom',//创建房间
    JoinRoom:'JoinRoom',//加入房间

    Ready:'Ready',// 准备
    UnReady:'UnReady',// 取消准备
    Leave:'Leave',//离开

    PullP:'PullP',//起牌
    PushP:'PushP',//出牌

    Peng:'Peng',//碰
    Gang:'Gang',//杠
    Hu:'Hu',//胡
    
}

module.exports.allRespond = {

    loginResoult:'loginResoult',//登录结果
    StartGame:'StartGame',//开始
    EndGame: 'EndGame',//结束
    CreateRoom: 'CreateRoom',//创建房间


    IntoRoom:'IntoRoom',// 双方进入房间
    Ready:'Ready',// 准备
    UnReady:'UnReady',// 取消准备
    OtherLeave:'OtherLeave',// 对方离开，包括开始前后

    GameStart:'GameStart',//游戏开始
    PullPs:'PullPs',//发牌
    PullP:'PullP',//起牌
    PushP:'PushP',//出牌

    Peng:'Peng',//碰
    Gang:'Gang',//杠
    Hu: 'Hu',//胡
    GameEnd:'GameEnd',//本局结束
}


module.exports.others = {
    disconnect: 'disconnect',

    game_ping: 'game_ping',
    game_pong:'game_pong',
}