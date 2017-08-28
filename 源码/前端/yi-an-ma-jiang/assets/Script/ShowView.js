cc.Class({
    extends: cc.Component,

    properties: {
        msg:cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },

    show:function(msg,showTime){
        this.node.active = true;
        this.msg.string = msg;
        let self = this;
        this.scheduleOnce(function(){self.node.active = false;},showTime);
    },
});
