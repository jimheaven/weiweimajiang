var utile = require('./utile');
var RoomMgr = require('./RoomMgr');
var ReqRsp = require('./ReqRsp');

var imgIndex = 0;
var imgs = ['aa', 'bb'];
var Letter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'C', 'H', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
function randomImg() {
    imgIndex++;
    return imgs[imgIndex % imgs.length];
}

var online = 0;
var io = null;

var allUser = {};

var check = false;
var matchList = [];
var tempMatchList = [];

setTimeout(() => { matckPlayer(); }, 3000);
/**
 * 简单的一个玩家匹配
 */
function matckPlayer() {
    check = true;
    let head = 0;
    let end = matchList.length -1;
    while (head < end) {
        for (; head < matchList.length; head++) {
            if (head == end) {
                break;
            }
            if (matchList[head].match) {
                break;
            }
        }
        for (; end > 0; end--) {
            if (head >= end) {
                break;
            }
            if (matchList[end].match) {
                if (matchList[head].token == matchList[end].token) {
                    continue;
                } else {
                    break;
                }
            }
        }
        if (head < end) {
            //创建房间，并不在匹配
            matchList[head].match = false;
            matchList[end].match = false;
            RoomMgr.createRoom(matchList[head], matchList[end]);
        }
    }

    for (let index in matchList) {
        if (matchList[index].match) {
            tempMatchList.push(matchList[index]);
        }
    }

    check = false;
    matchList = tempMatchList;
    tempMatchList = [];
    setTimeout(() => { matckPlayer(); }, 3000);
};

module.exports.start = function () {
    io = require('socket.io')(9000);
    io.sockets.on('connection', function (socket) {
        online++;
        socket.on(ReqRsp.allRequist.login, function (data) {
            let userName = '';
            for (let i = 0; i < 4; i++) {
                let r = Number.parseInt(Math.random() * 100) % 26;
                userName += Letter[r];
            }
            let rimg = randomImg();
            let userInfo = { token: utile.createuuid(16, 10), img: rimg, name: userName, match: false, ready: false, socket: socket,roomNumber:-1 };
            allUser[userInfo.token] = userInfo;
            socket.userInfo = userInfo;
            //返回玩家数据
            socket.emit(ReqRsp.allRespond.loginResoult, { tokeng: userInfo.token, img: userInfo.img, name: userName })
        });


        socket.on(ReqRsp.others.disconnect, function (data) {
            online--;
            let userInfo = socket.userInfo;
            userInfo.match = false;
            userInfo.ready = false;
            if (userInfo.roomNumber != -1){
                RoomMgr.playerDisconnect(userInfo.roomNumber, userInfo.token);
            }
            delete allUser[userInfo.token];
        });

        socket.on(ReqRsp.allRequist.StartGame, function (data) {
            let userInfo = socket.userInfo;
            if (userInfo.roomNumber == -1) {
                userInfo.match = true;
                if (!check) {
                    matchList.push(userInfo);
                } else {
                    tempMatchList.push(userInfo);
                }
                socket.emit(ReqRsp.allRespond.StartGame, {});
            } else {
                //以在房间中
            }
        });

        socket.on(ReqRsp.allRequist.EndGame, function (data) {
            socket.userInfo.match = false;
            socket.emit(ReqRsp.allRespond.EndGame, {});
        });

        socket.on(ReqRsp.allRequist.CreateRoom, function (data) {
            //后面加入会员才可以创建房间
            RoomMgr.createRoomByPwd(socket.userInfo);
        });

        socket.on(ReqRsp.allRequist.JoinRoom, function (data) {
            let join = JSON.parse(data);
            let code = RoomMgr.joinRoom(socket.userInfo, join.roomNumber, join.pwd);
            if (code === 1) {
                //房间不存在
                socket.emit('', {});
            } else if (code === 2) {
                //房间满了
                socket.emit('', {});
            } else if (code === 3) {
                //密码错误
                socket.emit('', {});
            }
        });

        socket.on(ReqRsp.others.game_ping, function (data) {
            socket.emit(ReqRsp.others.game_pong, { online: online });
        });

    });
    console.log("majiang server is listening on 9000");
}

