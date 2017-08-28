var FreeP = require('./FreeP');

cc.Class({
    extends: cc.Component,

    properties: {
        _freeNode:cc.Node,
    },

    
    onLoad: function () {
        this.node.on(cc.Node.EventType.MOUSE_DOWN,function(event){
            this._freeNode = FreeP.getFreeCard();
            this._freeNode.parent = cc.jim.freePNode;
            let po = this._freeNode.parent.convertTouchToNodeSpace(event);
            this._freeNode.position = po;
            cc.log(this._freeNode.position);
            let fp = this._freeNode.getComponent('FreeP');
            fp.setResourseNode(this.node,po);
            this.node.active = false;
        },this);
    },

    endMove:function(){
        let freeP = this._freeNode.getComponent('FreeP');
        freeP.moveToEnd();
        this._freeNode = null;
    },
});
