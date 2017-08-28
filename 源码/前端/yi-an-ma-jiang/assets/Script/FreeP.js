var FreeP = cc.Class({
    extends: cc.Component,

    properties: {
        atlas:cc.SpriteAtlas,

        _resourseNode:cc.Node,
        _endup:false,
        _rect:cc.Rect,
        _num:0,
        _original:cc.v2,
    },

    statics:{
        freePPool:new cc.NodePool(),
    },

    

    onLoad: function () {
        this.node.on(cc.Node.EventType.MOUSE_MOVE,function(event){
            if(this._endup){
                let po = this.node.parent.convertTouchToNodeSpace(event);
                this.node.setPosition(po);
            }
        },this);
        this.node.on(cc.Node.EventType.MOUSE_UP,function(event){
            if(this._endup){
                if(this._rect.contains(event.getLocation())){
                    cc.log('push');
                    let ev = new cc.Event.EventCustom('OnePush', true);
                    ev.setUserData({ num:this._num});
                    this.node.dispatchEvent(ev);
                }else{
                    cc.log('error');
                    this.errMove();
                }
                
            }
            this._endup = false;
        },this);
    },

    setResourseNode:function(resourseNode,original){
        let p = resourseNode.getComponent('P');
        this._num = p.num;
        this._original = original;
        this._resourseNode = resourseNode;
        this._endup = true;
        let area = this.node.parent.getChildByName('area');
        this._rect = area.getBoundingBoxToWorld();
        this.setImg();
    },

    setImg:function(){
        let str = 'M_';
        let gmgr = cc.jim.PType;
        if(gmgr === 1){
            str +='bamboo_'
        }else if(gmgr === 2){
            str += 'character_'
        }else if(gmgr === 3){
            str += 'dot_';
        }
        str += this._num;
        let sf = this.atlas.getSpriteFrame (str);
        let ts = this.node.getComponent(cc.Sprite);
        ts.spriteFrame = sf;
    },

    errMove:function(){
        //cc.log(cardview.node.position);
        let self = this;
        let list = [];
        let at = cc.moveTo (0.5,this._original);
        at.easing(cc.easeOut(3.0));
        list.push(at);
        let finish = cc.callFunc(function(){
            self._resourseNode.active = true;
            let chooseP = self._resourseNode.getComponent('ChooseP');
            chooseP._freeNode = null;
            pushFreeCard(self.node);
        });
        list.push(finish);
        let seq = cc.sequence(list);
        this.node.runAction (seq);
    },

    moveToEnd:function(){
        // 暂时先直接隐藏
        pushFreeCard(this.node)
    },

    
});

function getFreeCard(){
        
    if(FreeP.freePPool.size() < 1) {
        let tmp = cc.instantiate(cc.jim.freeP);
        FreeP.freePPool.put(tmp);
    }
    return FreeP.freePPool.get();
}
    
function pushFreeCard(pushNode){
    FreeP.freePPool.put(pushNode);
}

module.exports.getFreeCard = getFreeCard;

module.exports.pushFreeCard = pushFreeCard;