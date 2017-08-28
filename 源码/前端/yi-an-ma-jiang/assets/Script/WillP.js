var ReqRsp = require('./ReqRsp');

cc.Class({
    extends: cc.Component,

    properties: {
        allWill:[cc.Node],
        clickButton:cc.Node,
        _index:0,
    },

    init:function(){
        this._index = 0;
        for(let index in this.allWill){
            this.allWill[index].active = true;
        }
    },

    getOne:function(){
        if(this._index < this.allWill.length){
            this.allWill[this._index].active = false;
            this._index ++;
        }
    },

    getList:function(num){
        for(let i=0;i<num;i++){
            this.getOne();
        }
    },

    //显示可以点击的牌
    showPullButton:function(){
        if(this.noP()){
            return;
        }
        this.clickButton.active = true;
        this.clickButton.position = this.allWill[this._index].position;
    },

    //隐藏可以点击的牌
    hidePullButton:function(){
        this.clickButton.active = false;
    },

    pullClick:function(){
        cc.jim.net.send(ReqRsp.allRequist.PullP,{});
    },

    noP:function(){
        return this._index == this.allWill.length;
    },
});
