cc.Class({
    extends: cc.Component,

    properties: {

        showImg:cc.Node,

        _show:false,
        
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        this.node.on(cc.Node.EventType.MOUSE_DOWN,function(event){
            self._show = true;
            self.showImg.active = true;
        });
        this.node.on(cc.Node.EventType.MOUSE_LEAVE,function(event){
            self._show = false;
            self.showImg.active = false;
        });
        this.node.on(cc.Node.EventType.MOUSE_UP,function(event){
            self._show = false;
            self.showImg.active = false;
        });
    },


    
});
