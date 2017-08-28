cc.Class({
    extends: cc.Component,

    properties: {

        myImg:cc.Sprite,
        myName:cc.Label,
        myReady:cc.Node,
        otherImg:cc.Sprite,
        otherName:cc.Label,
        otherReady:cc.Node,

        readyButton:cc.Label,
        
    },

    // use this for initialization
    onLoad: function () {

        this.myName.node.active = false;
        this.myImg.node.active = false;
        this.myReady.active = false;

        this.otherName.node.active = false;
        this.otherImg.node.active = false;
        this.otherReady.active = false;

    },

    showMeInfo(){
        this.myName.node.active = true;
        this.myImg.node.active = true;
        let self = this;
        this.myName.string = cc.jim.myInfo.name;
        cc.loader.loadRes("imgs/"+cc.jim.myInfo.img,cc.SpriteFrame, function (err, img) {
            self.myImg.spriteFrame = img;
        });
    },

    setOtherInfo(show,img,name){
        if(show){
            this.otherName.node.active = true;
            this.otherImg.node.active = true;
            this.otherName.string  = name;
            let self = this;
            cc.loader.loadRes("imgs/"+img,cc.SpriteFrame, function (err, img) {
                self.otherImg.spriteFrame = img;
            });
            this.readyButton.node.parent.active = true;
        }else{
            this.otherName.node.active = false;
            this.otherImg.node.active = false;
            this.otherReady.active = false;

            this.readyButton.node.parent.active = false;
            this.myReady.active = false;
            this.readyButton.string = '准备';
        }
    },

    startGame:function(){
        this.readyButton.node.parent.active = false;
        this.myReady.active = false;
        this.otherReady.active = false;
    },

    ready:function(me){
        if(me){
            this.myReady.active = true;
            this.readyButton.string = '取消';
        }else{
            this.otherReady.active = true;
        }
    },

    unready:function(me){
        if(me){
            this.myReady.active = false;
            this.readyButton.string = '准备';
        }else{
            this.otherReady.active = false;
        }
    },

    endGame:function(){
        this.myReady.active = false;
        this.readyButton.string = '准备';
        this.readyButton.node.parent.active = true;
    },

});
