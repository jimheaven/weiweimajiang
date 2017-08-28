
cc.Class({
    extends: cc.Component,

    properties: {
        atlas:cc.SpriteAtlas,
        allPush:[cc.Node],
        _index:0,
    },

    // use this for initialization
    onLoad: function () {
       
    },

    init:function(){
        this._index = 0;
        for(let index in this.allPush){
            this.allPush[index].active = false;
        }
    },

    push:function(num){
        let n = this.allPush[this._index];
        n.active = true;
        this._index ++;
        let str = 'B_';
        let gmgr = cc.jim.PType;
        if(gmgr === 1){
            str +='bamboo_'
        }else if(gmgr === 2){
            str += 'character_'
        }else if(gmgr === 3){
            str += 'dot_';
        }
        str += num;
        let sf = this.atlas.getSpriteFrame (str);
        let ts = n.getComponent(cc.Sprite);
        ts.spriteFrame = sf;
    },

    hideOneShowP:function(){
        this._index--;
        let n = this.allPush[this._index];
        n.active = false;
    },

});
