var OtherPush = require('./OtherPush');
var P = require('./P');
var ShowPs = require('./ShowPs');

cc.Class({
    extends: cc.Component,

    properties: {
        otherShow:ShowPs,
        otherPush:OtherPush,
        otherPs:[P],
        otherPull:P,
        hideSF:cc.SpriteFrame,
        _showIndex:7,
    },

    init:function(){
        for(let index in this.otherPs){
            this.otherPs[index].node.active = false;
            this.otherPs[index].node.scale = 1;
        }
        this._showIndex = 7;
        this.otherPull.node.active = false;
        this.otherPull.node.scale = 1;
        this.otherPull.hideP(this.hideSF);
        this.otherShow.init();
        this.otherPush.init();
    },


    initPs:function(){
        this.otherPull.active = false;
        for(let index in this.otherPs){
            this.otherPs[index].node.active = true;
            this.otherPs[index].hideP(this.hideSF);
        }
    },

    //获得一张,可以考虑来个动画
    pullP:function(){
        this.otherPull.node.active = true;

    },

    //出牌,可以考虑来个动画
    pushP:function(num){
        if(!this.otherPull.node.active){
            this._showIndex --;
            this.otherPs[this._showIndex].node.active = false;
        }
        this.otherPull.node.active = false;
        this.otherPush.push(num);
    },

    //碰牌
    pengP:function(num){
        for(let i=0;i<2;i++){
            this._showIndex --;
            this.otherPs[this._showIndex].node.active = false;
        }
        this.otherShow.show(num,true);
    },

    //杠牌
    gangP:function(num,hand,peng){
        let ag = (hand && !peng);
        let count = 3;
        if(peng)
        {
            count = 0;
        }
        for(let i=0;i<count;i++){
            this._showIndex --;
            this.otherPs[this._showIndex].node.active = false;
        }
        this.otherShow.show(num,false,hand,!ag);
        this.otherPull.node.active = false;
    },

    //胡牌  list 
    showAll:function(list){
        this.otherPull.node.active = false;
        for(let index in this.otherPs){
            this.otherPs[index].node.active = false;
            this.otherPs[index].num = 0;
        }
        for(let key =0;key<this.otherPs.length;key++){
            this.otherPs[key].node.active = true;
            this.otherPs[key].setShowNumber(list[key]);
            this.otherPs[key].node.scale = 0.74;
        }
        if(this.otherPs.length < list.length){
            this.otherPull.node.scale = 0.74;
            this.otherPull.node.active = true;
            this.otherPull.setShowNumber(list[list.length - 1]);
        }
    },

    hideOneShowP:function(){
        this.otherPush.hideOneShowP();
    },

});
