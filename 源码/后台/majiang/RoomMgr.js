var utile = require('./utile');
var ReqRsp = require('./ReqRsp');


var allRoom = {};
var allPs = [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9];
var RoomNumber = 0;

var alpha = 'alpha';
var beta = 'beta';

function Room(alpha, beta0) {
    this.roomNumber = RoomNumber;
    this.alpha = alpha;
    this.beta = beta0 || null;
    this.pwd = '';
    this.host = '';
    this.first = beta;
    this.gameTimes = 0;
    this.roomAllPs = [];
    this.playerPs = { alphaHP: [], alphaSP: { peng: [], gang: [] }, betaHP: [], betaSP: { peng: [], gang: [] }, whoTurn: '', pushP: 0, gang: false };
}

Room.prototype.wait = function () {
    this.alpha.roomNumber = this.roomNumber;
    this.beta.roomNumber = this.roomNumber;
    this.alpha.ready = false;
    this.beta.ready = false;
    this.gameTimes = 0;
    //对方信息,包括房间号房间号,给个花色
    this.alpha.socket.emit(ReqRsp.allRespond.IntoRoom, { otherImg: this.beta.img, otherName: this.beta.name, roomNumber: this.roomNumber, who: alpha });
    this.beta.socket.emit(ReqRsp.allRespond.IntoRoom, { otherImg: this.alpha.img, otherName: this.alpha.name, roomNumber: this.roomNumber, who: beta });
    //开启监听
    let self = this;
    this.alpha.socket.on(ReqRsp.allRequist.Ready, ready.bind(self, alpha) );
    this.alpha.socket.on(ReqRsp.allRequist.UnReady, unReady.bind(self, alpha) );
    
    this.alpha.socket.on(ReqRsp.allRequist.PullP, pullP.bind(self, alpha) );
    this.alpha.socket.on(ReqRsp.allRequist.PushP, function (data) { pushP.bind(self, alpha, data)(); });
    this.alpha.socket.on(ReqRsp.allRequist.Peng, peng.bind(self, alpha) );
    this.alpha.socket.on(ReqRsp.allRequist.Gang, function (data) { gang.bind(self, alpha, data)();  });
    this.alpha.socket.on(ReqRsp.allRequist.Hu, hu.bind(self, alpha) );



    this.beta.socket.on(ReqRsp.allRequist.Ready, ready.bind(self, beta) );
    this.beta.socket.on(ReqRsp.allRequist.UnReady, unReady.bind(self, beta));
    this.beta.socket.on(ReqRsp.allRequist.Leave, leave.bind(self, self.beta.token));
    this.beta.socket.on(ReqRsp.allRequist.PullP, pullP.bind(self, beta) );
    this.beta.socket.on(ReqRsp.allRequist.PushP, function (data) { pushP.bind(self, beta, data)(); });
    this.beta.socket.on(ReqRsp.allRequist.Peng, peng.bind(self, beta) );
    this.beta.socket.on(ReqRsp.allRequist.Gang, function (data) { gang.bind(self, beta, data)(); });
    this.beta.socket.on(ReqRsp.allRequist.Hu, hu.bind(self, beta) );
}



/**
* 离开
*/
function leave(whostoken) {
    if (whostoken == this.alpha.token) {
        _leave.bind(this, this.alpha, this.beta)();
    } else {
        _leave.bind(this, this.beta, this.alpha)();
        this.beta = null;
    }
}

function _leave(who,other) {
    if (this.host != '') {
        if (who.token == this.host) {
            //解散房间
            if (who != null && who.socket.connected) {
                who.socket.emit(ReqRsp.allRespond.EndGame, {});
                who.roomNumber = -1;
                RemoveListener(who.socket);
            }
            if (other != null && other.socket.connected) {
                other.socket.emit(ReqRsp.allRespond.EndGame, {});
                other.roomNumber = -1;
                RemoveListener(other.socket);
            }
            this.alpha = null;
            this.beta = null;
            delete allRoom[this.roomNumber];
        } else {
            //对方离开
            if (other != null && other.socket.connected) {
                this.pwd = utile.createuuid(4, 10);
                other.socket.emit(ReqRsp.allRespond.OtherLeave, { pwd: this.pwd });
                if (who != null && who.socket.connected) {
                    who.roomNumber = -1;
                    RemoveListener(who.socket);
                }
                other.ready = false;
                console.log('other leave');
            }
        }
    } else {
        //解散房间
        if (who != null && who.socket.connected) {
            who.socket.emit(ReqRsp.allRespond.EndGame, { });
            who.roomNumber = -1;
            RemoveListener(who.socket);
        }
        if (other != null && other.socket.connected) {
            other.socket.emit(ReqRsp.allRespond.EndGame, {});
            other.roomNumber = -1;
            RemoveListener(other.socket);
        }
        
        this.alpha = null;
        this.beta = null;
        delete allRoom[this.roomNumber];
    }
}

function ready(who) {
    if (who === alpha) {
        this.alpha.ready = true;
        if (!this.beta.ready){
            this.alpha.socket.emit(ReqRsp.allRespond.Ready, { who: who });
            this.beta.socket.emit(ReqRsp.allRespond.Ready, { who: who });
        } else {
            this.alpha.ready = false;
            this.beta.ready = false;
            gameStart.bind(this)();
        }
    } else {
        this.beta.ready = true;
        if (!this.alpha.ready) {
            this.alpha.socket.emit(ReqRsp.allRespond.Ready, { who: who });
            this.beta.socket.emit(ReqRsp.allRespond.Ready, { who: who });
        } else {
            this.alpha.ready = false;
            this.beta.ready = false;
            gameStart.bind(this)();
        }
    }
    
}

function unReady(who) {
    if (who === alpha) {
        this.alpha.ready = false;
    } else {
        this.beta.ready = false;
    }
    this.alpha.socket.emit(ReqRsp.allRespond.UnReady, { who: who });
    this.beta.socket.emit(ReqRsp.allRespond.UnReady, { who: who });
}

function gameStart() {
    this.gameTimes++;
    this.playerPs = { alphaHP: [], alphaSP: { peng: [], gang: [] }, betaHP: [], betaSP: { peng: [], gang: [] }, whoTurn: '', pushP: 0, pullP: 0, gang: false };
    this.roomAllPs = allPs.concat();
    //随机洗牌
    for (let i = 0; i < 200; i++) {
        let r = Number.parseInt(Math.random() * 100) % 36;
        let numTemp = this.roomAllPs[r];
        this.roomAllPs.splice(r, 1);
        this.roomAllPs.push(numTemp);
    }
    for (let i = 0; i < 7; i++) {
        this.playerPs.alphaHP.push(this.roomAllPs.pop());
    }
    for (let i = 0; i < 7; i++) {
        this.playerPs.betaHP.push(this.roomAllPs.pop());
    }
    /*
    this.playerPs.alphaHP.push(5);
    this.playerPs.alphaHP.push(5);
    this.playerPs.alphaHP.push(6);
    this.playerPs.alphaHP.push(7);
    this.playerPs.alphaHP.push(8);
    this.playerPs.alphaHP.push(8);
    this.playerPs.alphaHP.push(9);
    */

    //console.log(this.roomAllPs + '/ ' + this.playerPs.alphaHP + '/ ' + this.playerPs.betaHP);
    this.playerPs.alphaHP.sort();
    this.playerPs.betaHP.sort();
    if (this.first == alpha) {
        this.first = beta;
        this.playerPs.whoTurn = beta;
    } else {
        this.first = alpha;
        this.playerPs.whoTurn = alpha;
    }
    this.alpha.socket.emit(ReqRsp.allRespond.GameStart, {});
    this.beta.socket.emit(ReqRsp.allRespond.GameStart, {});
    this.alpha.socket.emit(ReqRsp.allRespond.PullPs, { list: this.playerPs.alphaHP, whoTurn: this.playerPs.whoTurn });
    this.beta.socket.emit(ReqRsp.allRespond.PullPs, { list: this.playerPs.betaHP, whoTurn: this.playerPs.whoTurn });

    setTimeout(function (room) {
        let num = room.roomAllPs.pop();
        if (room.first == alpha) {
            room.playerPs.alphaHP.push(num);
            room.playerPs.alphaHP.sort();
            room.alpha.socket.emit
                (ReqRsp.allRespond.PullP, { p: num, who: alpha, opera: { gang: checkGang(num, room.playerPs.alphaHP, room.playerPs.alphaSP, true).check, hu: checkHu(num, room.playerPs.alphaHP, true).check } });
            room.beta.socket.emit(ReqRsp.allRespond.PullP, { who: alpha });
        } else {
            room.playerPs.betaHP.push(num);
            room.playerPs.betaHP.sort();
            room.alpha.socket.emit(ReqRsp.allRespond.PullP, { who: beta});
            room.beta.socket.emit
                (ReqRsp.allRespond.PullP, { p: num, who: beta, opera: { gang: checkGang(num, room.playerPs.betaHP, room.playerPs.betaSP, true).check, hu: checkHu(num, room.playerPs.betaHP, true).check } });
        }
    }, 3000, this);
}

function pullP(who) {
    if (who == this.playerPs.whoTurn) {
        let num = this.roomAllPs.pop();
        this.playerPs.pullP = num;
        this.playerPs.pushP = 0;
        if (who == alpha) {
            this.playerPs.alphaHP.push(num);
            this.playerPs.alphaHP.sort();
            //console.log('alpha pull '+this.playerPs.alphaHP);
            this.alpha.socket.emit(ReqRsp.allRespond.PullP, { p: num, who: alpha, opera: { gang: checkGang(num, this.playerPs.alphaHP, this.playerPs.alphaSP, true).check, hu: checkHu(num, this.playerPs.alphaHP, true).check } });
            this.beta.socket.emit(ReqRsp.allRespond.PullP, { who: alpha });
        } else {
            this.playerPs.betaHP.push(num);
            this.playerPs.betaHP.sort();
            //console.log('beta pull ' + this.playerPs.betaHP);
            this.alpha.socket.emit(ReqRsp.allRespond.PullP, { who: beta });
            this.beta.socket.emit(ReqRsp.allRespond.PullP, { p: num, who: beta, opera: { gang: checkGang(num, this.playerPs.betaHP, this.playerPs.betaSP, true).check, hu: checkHu(num, this.playerPs.betaHP, true).check } });
        }
    } else {
        //玩家异常
        console.log('异常取牌');
    }
}

function pushP(who, data) {
    let info = JSON.parse(data);
    if (this.roomAllPs.length == 0) {
        //游戏结束
        this.alpha.socket.emit(ReqRsp.allRespond.PushP, { who: who, num: info.num, opera: { gang: false, peng: false, hu: false } });
        this.beta.socket.emit(ReqRsp.allRespond.PushP, { who: who, num: info.num, opera: { gang: false, peng: false, hu: false } });
        this.alpha.socket.emit(ReqRsp.allRespond.GameEnd, { });
        this.beta.socket.emit(ReqRsp.allRespond.GameEnd, { });
        return;
    }
    if (who == this.playerPs.whoTurn) {
        this.playerPs.gang = false;
        let num = info.num;
        let handP = this.playerPs.pullP;
        this.playerPs.pushP = num;
        this.playerPs.pullP = 0;
        if (who == alpha) {
            let pushIndex = this.playerPs.alphaHP.indexOf(num);
            this.playerPs.alphaHP.splice(pushIndex, 1);
            this.playerPs.whoTurn = beta;
            this.alpha.socket.emit(ReqRsp.allRespond.PushP, { who: who, num: num });
            this.beta.socket.emit(ReqRsp.allRespond.PushP, {
                who: who, num: num, opera:
                { hu: checkHu(num, this.playerPs.betaHP, false).check, peng: checkPeng(num, this.playerPs.betaHP).check, gang: checkGang(num, this.playerPs.betaHP, this.playerPs.betaSP, false).check }
            });
        } else {
            let pushIndex = this.playerPs.betaHP.indexOf(num);
            this.playerPs.betaHP.splice(pushIndex, 1);
            this.playerPs.whoTurn = alpha;
            this.alpha.socket.emit(ReqRsp.allRespond.PushP, {
                who: who, num: num, opera:
                { hu: checkHu(num, this.playerPs.alphaHP, false).check, peng: checkPeng(num, this.playerPs.alphaHP).check, gang: checkGang(num, this.playerPs.alphaHP, this.playerPs.alphaSP, false).check }
            });
            this.beta.socket.emit(ReqRsp.allRespond.PushP, { who: who, num: num });
        }
    } else {
        //玩家异常
        console.log('异常出牌');
    }
}

function peng(who) {
    if (who == this.playerPs.whoTurn) {
        if (who == alpha) {
            let resoult = checkPeng(this.playerPs.pushP, this.playerPs.alphaHP);
            if (resoult.check) {
                this.playerPs.alphaHP.splice(resoult.point, 2);
                this.playerPs.alphaSP.peng.push(this.playerPs.pushP);
                console.log('alpha peng ' + this.playerPs.alphaSP.peng);
                this.alpha.socket.emit(ReqRsp.allRespond.Peng, { who: who, num: this.playerPs.pushP });
                this.beta.socket.emit(ReqRsp.allRespond.Peng, { who: who, num: this.playerPs.pushP });
                this.playerPs.pushP = 0;
            } else {
                //玩家异常
                console.log('异常碰牌逻辑');
            }
        } else {
            let resoult = checkPeng(this.playerPs.pushP, this.playerPs.betaHP);
            if (resoult.check) {
                this.playerPs.betaHP.splice(resoult.point, 2);
                this.playerPs.betaSP.peng.push(this.playerPs.pushP);
                //console.log('beta peng ' + this.playerPs.betaSP.peng);
                this.alpha.socket.emit(ReqRsp.allRespond.Peng, { who: who, num: this.playerPs.pushP });
                this.beta.socket.emit(ReqRsp.allRespond.Peng, { who: who, num: this.playerPs.pushP });
                this.playerPs.pushP = 0;
            } else {
                //玩家异常
                console.log('异常碰牌逻辑');
            }
        }
    } else {
        console.log('异常碰牌');
        //玩家异常
    }
}

function gang(who,data) {
    let info = JSON.parse(data);
    if (who == this.playerPs.whoTurn) {
        this.playerPs.gang = true;
        let hand = this.playerPs.pushP == 0;
        if (who == alpha) {
            let resoult = checkGang(info.num, this.playerPs.alphaHP, this.playerPs.alphaSP, hand);
            if (resoult.check) {
                if (resoult.peng) {
                    let index = this.playerPs.alphaHP.indexOf(info.num);
                    if (index != -1) {
                        this.playerPs.alphaHP.splice(index, 1);
                    }
                    this.alpha.socket.emit(ReqRsp.allRespond.Gang, { who: who, num: resoult.num, peng: resoult.peng, hand: hand });
                    this.beta.socket.emit(ReqRsp.allRespond.Gang, { who: who, num: resoult.num, peng: resoult.peng, hand: hand });
                } else {
                    if (hand) {
                        this.playerPs.alphaHP.splice(resoult.point, 4);
                    } else {
                        this.playerPs.alphaHP.splice(resoult.point, 3);
                    }
                    
                    this.alpha.socket.emit(ReqRsp.allRespond.Gang, { who: who, num: resoult.num, peng: resoult.peng, hand: hand });
                    this.beta.socket.emit(ReqRsp.allRespond.Gang, { who: who, num: resoult.num, peng: resoult.peng, hand: hand });
                }
                this.playerPs.pushP = 0;
                this.playerPs.pullP = 0;
                setTimeout(pullP.bind(this, who), 500);
            } else {
                //玩家异常
            }
        } else {
            let resoult = checkGang(info.num, this.playerPs.betaHP, this.playerPs.betaSP, hand);
            if (resoult.check) {
                if (resoult.peng) {
                    let index = this.playerPs.betaHP.indexOf(info.num);
                    this.playerPs.betaHP.splice(index, 1);
                    this.alpha.socket.emit(ReqRsp.allRespond.Gang, { who: who, num: info.num, peng: resoult.peng, hand: hand });
                    this.beta.socket.emit(ReqRsp.allRespond.Gang, { who: who, num: info.num, peng: resoult.peng, hand: hand });
                } else {
                    if (hand) {
                        this.playerPs.betaHP.splice(resoult.point, 4);
                    } else {
                        this.playerPs.betaHP.splice(resoult.point, 3);
                    }

                    this.alpha.socket.emit(ReqRsp.allRespond.Gang, { who: who, num: info.num, peng: resoult.peng, hand: hand });
                    this.beta.socket.emit(ReqRsp.allRespond.Gang, { who: who, num: info.num, peng: resoult.peng, hand: hand });
                }
                this.playerPs.pushP = 0;
                this.playerPs.pullP = 0;
                setTimeout(pullP.bind(this, who), 500);
            } else {
                //玩家异常
            }
        }
    } else {
        //玩家异常
    }
}

function hu(who) {
    if (who == this.playerPs.whoTurn) {
        let hand = this.playerPs.pushP == 0;
        if (who == alpha) {
            let resoult = checkHu(this.playerPs.pushP, this.playerPs.alphaHP, hand);
            if (resoult.check) {
                resoult.multiple += this.playerPs.alphaSP.gang.length;
                if (!hand) {
                    this.playerPs.alphaHP.push(this.playerPs.pushP);
                }
                if (this.playerPs.alphaSP.gang.length != 0) {
                    resoult.type = '平胡';
                    if (this.playerPs.alphaSP.gang.length == 2) {
                        resoult.multiple++;
                    }
                }
                this.alpha.socket.emit(ReqRsp.allRespond.Hu, { who: who, alpha: this.playerPs.alphaHP, beta: this.playerPs.betaHP, hand: hand, num: this.playerPs.pushP, resoult: resoult });
                this.beta.socket.emit(ReqRsp.allRespond.Hu, { who: who, alpha: this.playerPs.alphaHP, beta: this.playerPs.betaHP, hand: hand, num: this.playerPs.pushP, resoult: resoult });
                this.alpha.socket.emit(ReqRsp.allRespond.GameEnd, { });
                this.beta.socket.emit(ReqRsp.allRespond.GameEnd, {});
            } else {
                
                //玩家异常
            }
        } else {
            let resoult = checkHu(this.playerPs.pushP, this.playerPs.betaHP, hand);
            if (resoult.check) {
                resoult.multiple += this.playerPs.betaSP.gang.length;
                if (!hand) {
                    this.playerPs.betaHP.push(this.playerPs.pushP);
                }
                if (this.playerPs.betaSP.gang.length != 0) {
                    resoult.type = '平胡';
                    if (this.playerPs.betaSP.gang.length == 2) {
                        resoult.multiple++;
                    }
                }
                this.alpha.socket.emit(ReqRsp.allRespond.Hu, { who: who, alpha: this.playerPs.alphaHP, beta: this.playerPs.betaHP, hand: hand, num: this.playerPs.pushP, resoult: resoult });
                this.beta.socket.emit(ReqRsp.allRespond.Hu, { who: who, alpha: this.playerPs.alphaHP, beta: this.playerPs.betaHP, hand: hand, num: this.playerPs.pushP, resoult: resoult });
                this.alpha.socket.emit(ReqRsp.allRespond.GameEnd, { });
                this.beta.socket.emit(ReqRsp.allRespond.GameEnd, { });
            } else {
                //玩家异常
            }
        }
    } else {
        //玩家异常
    }
}

function checkPeng(num, list) {
    let resoult = { check: false, point: -1 };
    let point = -1;
    let count = 0;
    for (let index in list) {
        if (list[index] == num) {
            if (point == -1) {
                point = index;
            }
            count++;
            if (count == 2) {
                break;
            }
        }
    }
    if (count == 2) {
        resoult.check = true;
        resoult.point = point;
    }

    return resoult;
}

function checkGang(num, hlist, smap, hand) {
    let resoult = { check: false, point: -1,peng: false,num: 0 };

    if (hand) {
        //起手检测碰牌中是否可杠
        let peng = smap.peng.indexOf(num);
        if (peng != -1) {
            resoult.peng = true;
            resoult.check = true;
            resoult.num = num;
        } 
    }

    if (!resoult.check) {
        for (let index in hlist) {
            if (smap.peng.indexOf(hlist[index]) != -1) {
                resoult.point = index;
                resoult.peng = true;
                resoult.check = true;
                resoult.num = hlist[index];
                break;
            }
        }
    }

    let findCount = 3;
    let count = 0;
    let point = -1;
    //检测手牌和出牌是否可杠
    if (!resoult.check && hlist.length > 3 && !hand) {
        for (let index in hlist) {
            if (hlist[index] == num) {
                if (point == -1) {
                    point = index;
                }
                count++;
                if (count == findCount) {
                    break;
                }
            }
        }
        if (count == findCount) {
            resoult.check = true;
            resoult.point = point;
            resoult.num = num;
        }
    }

    if (!resoult.check && hlist.length > 3) {
        for (let index = 0; index < hlist.length - 3; index++) {
            //console.log(hlist[index] + ' ' + hlist[index + 1] + ' ' + hlist[index + 2] + ' ' + hlist[index + 3]);
            if (hlist[index] == hlist[index + 1] && hlist[index] == hlist[index + 2]
                && hlist[index] == hlist[index + 3]) {
                resoult.check = true;
                resoult.point = index;
                resoult.num = hlist[index];
                break;
            }
        }
        
    }
    
    return resoult;
}

function checkHu(num, list, hand) {
    let resoult = { check: false, multiple: 0, type:'平胡' };
    let checkList = [];
    for (let index in list) {
        checkList.push(0);
    }
    list = list.concat();
    if (!hand) {
        list.push(num);
        list.sort();
        checkList.push(0);
    }
    if (list.length == 2) {
        if (list[0] == list[1]) {
            resoult.check = true;
            resoult.multiple++;
            resoult.type = '三元';
        }
        //console.log(list[0] + ' ' + list[1] + ' ' + resoult.ckeck);
    } else if (list.length == 5) {
        if (checkHuByEightAsRight(list, checkList)) {
            let count = checkMoreCount(list, checkList);
            if (count.doubleCount == 1 && (count.threeCount == 0 || count.threeCount == 1)) {
                //12333 12223 11123 11234 12344   44888 44488 
                resoult.check = true;
                if (count.threeCount == 1){
                    resoult.type = '三元';
                }
            }
        }
        
    } else if (list.length == 8) {
        let yes = checkHuByEightAsRight(list, checkList);
        if (!yes) {
            for (let index in checkList) {
                checkList[index] = 0;
            }
            yes = checkHuByEightAsLeft(list, checkList);
        }
        if (yes) {
            resoult.check = true;
            let count = checkMoreCount(list, checkList);
            if (count.fourCount == 2) {
                resoult.multiple = 4;
                resoult.type = '大龙';
            } else if (count.fourCount == 1) {
                resoult.multiple = 3;
                resoult.type = '龙对';
            } else if (count.threeCount == 2) {
                resoult.type = '三元';
                resoult.multiple = 1;
            } else if (count.doubleCount == 4) {
                resoult.type = '暗对';
                resoult.multiple = 2;
            }
        }
    }
    return resoult;
}

function checkHuByEightAsRight(list, checkList) {
    for (let i = 0; i < list.length - 1; i++) {
        if (checkList[i] == 0) {
            let k = i + 1;
            let isDouble = false;
            for (; k < list.length; k++) {
                if (checkList[k] == 0) {
                    if (list[i] == list[k]) {
                        isDouble = true;
                    }
                    break;
                }
            }
            
            if (isDouble) {
                i = k;
                if (k + 1 < list.length && list[k + 1] == list[i]) {
                    i++;
                }
                if (k + 2 < list.length && list[k + 2] == list[i]) {
                    i++;
                }
                continue;
            }
            if (k == list.length) {
                return false;
            }
            //单
            let j = k + 1;
            for (; j < list.length; j++) {
                if (checkList[j] == 0) {
                    if (list[j] != list[k]) {
                        break;
                    }
                }
            }
            
            if (j != list.length && list[j] == list[k] + 1 && list[k] == list[i] + 1) {
                
                checkList[i] = 1;
                checkList[j] = 1;
                checkList[k] = 1;
                return checkHuByEightAsRight(list, checkList);
            } else {
                j = i - 1;
                for (; j >= 0; j--) {
                    if (checkList[j] == 0) {
                        if (list[j] != list[i]) {
                            break;
                        }
                    }
                }
                if (j < 0) {
                    return false;
                } else {
                    if (list[k] == list[i] + 1 && list[i] == list[j] + 1) {
                        checkList[i] = 1;
                        checkList[j] = 1;
                        checkList[k] = 1;
                        return checkHuByEightAsRight(list, checkList);
                    } else {
                        let z = j;
                        j = z - 1;
                        for (; j >= 0; j--) {
                            if (checkList[j] == 0 && list[j] != list[z]) {
                                break;
                            }
                        }
                        if (j < 0) {
                            return false;
                        }
                        if (list[i] == list[z] + 1 && list[z] == list[j] + 1) {
                            checkList[i] = 1;
                            checkList[j] = 1;
                            checkList[z] = 1;
                            return checkHuByEightAsRight(list, checkList);
                        } else {
                            return false;
                        }

                    }
                }
            }
        }
    }
    let resoult = false;
    if (list[list.length - 1] == list[list.length - 2] && checkList[list.length - 1] == 0 && checkList[list.length - 2] == 0) {
        resoult = true;
    } else if (checkList[list.length - 1] != 0) {
        resoult = true;
    }
    return resoult;
}

function checkHuByEightAsLeft(list, checkList) {
    for (let i = list.length - 1; i > 0; i--) {
        if (checkList[i] == 0) {
            let k = i - 1;
            let isDouble = false;
            for (; k >= 0; k--) {
                if (checkList[k] == 0) {
                    if (list[i] == list[k]) {
                        isDouble = true;
                    }
                    break;
                }
            }
            if (isDouble) {
                i = k;
                if (k - 1 >= 0 && list[k - 1] == list[i]) {
                    i--;
                }
                if (k - 2 >= 0 && list[k - 2] == list[i]) {
                    i--;
                }
                continue;
            }
            if (k < 0) {
                return false;
            }
            //单
            let j = k - 1;
            for (; j >= 0; j--) {
                if (checkList[j] == 0) {
                    if (list[j] != list[k]) {
                        break;
                    }
                }
            }
            if (j >= 0 && list[i] == list[k] + 1 && list[k] == list[j] + 1) {
                checkList[i] = 1;
                checkList[j] = 1;
                checkList[k] = 1;
                return checkHuByEightAsLeft(list, checkList);
            } else {
                j = i + 1;
                for (; j < list.length; j++) {
                    if (checkList[j] == 0) {
                        if (list[j] != list[i]) {
                            break;
                        }
                    }
                }
                if (j == list.length) {
                    return false;
                }
                if (list[j] == list[i] + 1 && list[i] == list[k] + 1) {
                    checkList[i] = 1;
                    checkList[j] = 1;
                    checkList[k] = 1;
                    return checkHuByEightAsLeft(list, checkList);
                } else {
                    let z = j;
                    j = z + 1;
                    for (; j < list.length; j++) {
                        if (checkList[j] == 0 && list[j] != list[z]) {
                            break;
                        }
                    }
                    if (j == list.length) {
                        return false;
                    }
                    if (list[j] == list[z] + 1 && list[z] == list[i] + 1) {
                        checkList[i] = 1;
                        checkList[j] = 1;
                        checkList[z] = 1;
                        return checkHuByEightAsLeft(list, checkList);
                    } else {
                        return false;
                    }
                }
            }

        }
    }
    let resoult = false;
    if (list[0] == list[1] && checkList[0] == 0 && checkList[1] == 0) {
        resoult = true;
    } else if (checkList[0] != 0) {
        resoult = true;
    }
    return resoult;
}

function checkMoreCount(list, checkList) {
    //console.log('checkMoreCount ' + list + ' ' + checkList);
    let count = { doubleCount: 0, threeCount: 0, fourCount: 0 };
    for (let i = 0; i < list.length; i++) {
        if (checkList[i] == 0) {
            let j = i + 1;
            for (; j < list.length; j++) {
                if (checkList[j] == 0) {
                    if (list[i] == list[j]) {
                        i = j;
                        let k = j + 1;
                        let isDouble = true;
                        for (; k < list.length; k++) {
                            if (checkList[k] == 0) {
                                if (list[j] == list[k]) {
                                    isDouble = false;
                                    let isThree = true;
                                    i = k;
                                    let l = k + 1;
                                    for (; l < list.length; l++) {
                                        if (checkList[l] == 0) {
                                            if (list[i] == list[l]) {
                                                i = l;
                                                isThree = false;
                                                count.fourCount++;
                                            }
                                            break;
                                        }
                                    }
                                    if (isThree) {
                                        count.threeCount++;
                                    }
                                }
                                break;
                            }
                        }
                        if (isDouble) {
                            count.doubleCount++;
                        }
                        break;
                    } else {
                        break;
                    }
                }
            }
        }
    }
    return count;
}

function RemoveListener(socket) {
    socket.removeAllListeners(ReqRsp.allRequist.Ready);
    socket.removeAllListeners(ReqRsp.allRequist.UnReady);
    socket.removeAllListeners(ReqRsp.allRequist.Leave);
    socket.removeAllListeners(ReqRsp.allRequist.PullP);
    socket.removeAllListeners(ReqRsp.allRequist.PushP);
    socket.removeAllListeners(ReqRsp.allRequist.Peng);
    socket.removeAllListeners(ReqRsp.allRequist.Gang);
    socket.removeAllListeners(ReqRsp.allRequist.Hu);
}

module.exports.createRoom = function (alpha, beta) {
    RoomNumber++;
    let room = new Room(alpha, beta);
    allRoom[room.roomNumber] = room;
    room.alpha.socket.on(ReqRsp.allRequist.Leave, leave.bind(room, room.alpha.token));
    room.wait();
}

module.exports.createRoomByPwd = function (alpha) {
    RoomNumber++;
    let room = new Room(alpha);
    allRoom[room.roomNumber] = room;
    room.host = alpha.token;
    room.pwd = utile.createuuid(4, 10);
    alpha.roomNumber = room.roomNumber;
    alpha.socket.emit(ReqRsp.allRespond.CreateRoom, { roomNumber: RoomNumber, pwd: room.pwd });
    room.alpha.socket.on(ReqRsp.allRequist.Leave, leave.bind(room, room.alpha.token));
    return room;
}

module.exports.joinRoom = function (beta,roomNumber,pwd) {
    if (allRoom[roomNumber] != 'undefined') {
        let room = allRoom[roomNumber];
        if (typeof (room) == 'undefined') {
            return 4;
        }
        if (typeof (room.beta) == 'undefined' || room.beta == null) {
            if (room.pwd == pwd) {
                room.beta = beta;
                room.wait();
                return 0;
            } else {
                return 3;
            }
            
        } else {
            return 2;
        }
    } else {
        return 1;
    }
}

module.exports.playerDisconnect = function (roomNumber, whostoken) {
    if (allRoom[roomNumber] != 'undefined') {
        let room = allRoom[roomNumber];
        leave.bind(room, whostoken)();
    }
}