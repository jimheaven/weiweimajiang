var MyP = require('./MyP');
var OtherP = require('./OtherP');
var WillP = require('./WillP');
var ReqRsp = require('./ReqRsp');
var PlayerInfo = require('./PlayerInfo');
var ShowView = require('./ShowView');
var GameEnd = require('./GameEnd');

cc.Class({
    extends: cc.Component,

    properties: {
        online:cc.Label,
        myP:MyP,
        otherP:OtherP,
        willP:WillP,
        playerInfo:PlayerInfo,
        loading:cc.Node,
        startNode:ShowView,
        infoButton:cc.Node,
        freePNode:cc.Node,
        roomNumber:cc.Label,
        pwd:cc.Label,
        inputRoomNumber:cc.EditBox,
        inputPwd:cc.EditBox,
        readyButton:cc.Node,
        leaveButton:cc.Node,
        gameEnd:GameEnd,

        _inRoom:false,
        _who:'',
        _ready:false,
        _gameTimes:0,
        _whoTurn:false,//true 自己
    },


    // use this for initialization
    onLoad: function () {

        cc.jim.freePNode = this.freePNode;

        cc.jim.online = this.online;

        this.init();
        let self = this;

        cc.jim.net.addHandler(ReqRsp.allRespond.loginResoult,function(data){
            cc.jim.myInfo = data;
            self.playerInfo.showMeInfo();
            self.loading.active = false;
            self.infoButton.active = true;
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.StartGame,function(data){
            self.loading.active = true;
            self.infoButton.active = false;
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.EndGame,function(data){
            if(self._gameTimes != 0){
                self.init();
            }
            self.loading.active = false;
            //self.readyButton.active = false;
            self.infoButton.active = true;
            self._inRoom = false;
            self.leaveButton.active = false;
            self.roomNumber.string = '';
            self.pwd.string = '';
            self._who = '';
            self._gameTimes = 0;
            self.playerInfo.setOtherInfo(false);
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.IntoRoom,function(data){
            self._who = data.who;
            self._inRoom = true;
            self.leaveButton.active = true;
            //self.readyButton.active = true;
            self.infoButton.active = false;
            self.loading.active = false;
            self.playerInfo.setOtherInfo(true,data.otherImg,data.otherName);
            self.roomNumber.string = data.roomNumber;
            self.pwd.string = '';
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.Ready,function(data){
            let isMe = data.who === self._who;
            self.playerInfo.ready(isMe);
            if(isMe){
                self._ready = true;
            }
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.UnReady,function(data){
            let isMe = data.who === self._who;
            self.playerInfo.unready(isMe);
            if(isMe){
                self._ready = false;
            }
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.OtherLeave,function(data){
            if(self._gameTimes != 0){
                self.init();
            }
            self._who = '';
            self._gameTimes = 0;
            self._whoTurn = false;
            self._ready = false;
            self.pwd.string = data.pwd;
            //self._inRoom = false;
            //self.loading.active = true;
            self.playerInfo.setOtherInfo(false);
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.GameStart,function(data){
            if(self._gameTimes != 0){
                self.init();
            }
            self.playerInfo.startGame();
            self._gameTimes++;
            self.startNode.show('第'+self._gameTimes+'局',3);
            self._ready = false;
            self.gameEnd.node.active = false;
        });

        //会在GameStart请求后的第2秒接收到请求
        cc.jim.net.addHandler(ReqRsp.allRespond.PullPs,function(data){
            self.willP.getList(14);
            self.myP.initPs(data.list);
            self.otherP.initPs();
            self._whoTurn = data.whoTurn === self._who;
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.PullP,function(data){
            let end = self.willP.noP();
            if(!end){
                self.willP.getOne();
            }
            end = self.willP.noP();
            if(data.who === self._who){
                self.myP.pullP(data.p,data.opera,end);
                self.willP.hidePullButton();
            }else{
                self.otherP.pullP();
            }
        });
        cc.jim.net.addHandler(ReqRsp.allRespond.PushP,function(data){
            let end = self.willP.noP();
            if(data.who === self._who){
                self.myP.pushP(data.num);
            }else{
                self.otherP.pushP(data.num);
            }
            self._whoTurn = data.who != self._who;
            //显示操作界面
            if(self._whoTurn){
                self.willP.showPullButton();
                cc.log(data.opera);
                self.myP.myTurn(data.num,data.opera,end);
            }
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.Peng,function(data){
            if(data.who === self._who){
                self.myP.pengP(data.num);
                self.willP.hidePullButton();
                self.otherP.hideOneShowP();
            }else{
                self.otherP.pengP(data.num);
                self.myP.hideOneShowP();
            }
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.Gang,function(data){

            if(data.who === self._who){
                self.myP.gangP(data.num,data.hand,data.peng);
                self.willP.hidePullButton();
                if(data.hand && !data.peng){
                    self.otherP.hideOneShowP();
                }
            }else{
                let ag = (data.hand && !data.peng)
                self.otherP.gangP(data.num,data.hand,data.peng);
                if(data.hand && !data.peng){
                    self.myP.hideOneShowP();
                }
            }
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.Hu,function(data){
            if(self._who == 'alpha'){
                //self.myP.huP(data.alpha);
                self.otherP.showAll(data.beta);
                
            }else{
                //self.myP.huP(data.beta);
                self.otherP.showAll(data.alpha);
            }
            if(!data.hand){
                if(self._who == data.who){
                    self.myP.pullP(data.num,{gane:false,hu:false},false);
                    self.otherP.hideOneShowP();
                }else{
                    self.myP.hideOneShowP();
                }
            }
            self.gameEnd.node.active = true;
            self.gameEnd.showEnd(data.resoult.type,data.resoult.multiple);
            //显示结果
        });

        cc.jim.net.addHandler(ReqRsp.allRespond.GameEnd,function(data){
            self.playerInfo.endGame();
            self._ready = false;
        });

        cc.jim.net.addHandler(ReqRsp.others.disconnect,function(data){cc.error('disconnect');});

        cc.jim.net.addHandler(ReqRsp.allRespond.CreateRoom,function(data){
            //创建成功
            self.roomNumber.string = data.roomNumber;
            self.pwd.string = '密码:'+data.pwd;
            self.infoButton.active = false;
            self.leaveButton.active = true;
        });


        this.scheduleOnce(this.connectServer,0.3);

        this.node.on('OnePush',function(event){
            let data = event.detail;
            cc.jim.net.send(ReqRsp.allRequist.PushP,{ num:data.num});
            event.stopPropagation();
        });
    },

    connectServer:function(){
        let self = this;
        cc.jim.net.connect(function(){
            cc.jim.net.send(ReqRsp.allRequist.login,{ name:self._who});
            self.infoButton.active = true;
            self.roomNumber.string = '';
            self.pwd.string = '';
        },function(){});
    },

    init:function(){
        this.myP.init();
        this.otherP.init();
        this.willP.init();
    },

    readyClick:function(){
        if(this._inRoom){
            if(!this._ready){
                cc.jim.net.send(ReqRsp.allRequist.Ready,{ who:this._who});
            }else{
               cc.jim.net.send(ReqRsp.allRequist.UnReady,{ who:this._who});
            }
        }
        
    },

    leave:function(){
        if(this._inRoom || this.roomNumber.string !== ''){
            cc.jim.net.send(ReqRsp.allRequist.Leave,{});
        }
    },

    startGameClick:function(){
        cc.jim.net.send(ReqRsp.allRequist.StartGame,{ });
        
    },

    endGameClick:function(){
        cc.jim.net.send(ReqRsp.allRequist.EndGame,{ });
    },

    createRoom:function(){
        cc.jim.net.send(ReqRsp.allRequist.CreateRoom,{});
    },

    joinRoom:function(){
        cc.log('joinRoom');
        cc.jim.net.send(ReqRsp.allRequist.JoinRoom,{ roomNumber: this.inputRoomNumber.string, pwd:this.inputPwd.string });
    },

});
