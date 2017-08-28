
cc.Class({

    extends: cc.Component,
    properties: {
        atlas:cc.SpriteAtlas,
        zatlas:cc.SpriteAtlas,
        num:0,
    },


    onLoad: function () {
        //this.setNumber(1);
    },

    noKownNumber:function(){
        let str = 'e_mj_b_up';
        let sf = this.atlas.getSpriteFrame (str);
        let ts = this.node.getComponent(cc.Sprite);
        ts.spriteFrame = sf;
    },

    hideP:function(sf){
        let ts = this.node.getComponent(cc.Sprite);
        ts.spriteFrame = sf;
    },

    setNumber:function(numb){
        this.num = numb;
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
        str += this.num;
        let sf = this.atlas.getSpriteFrame (str);
        let ts = this.node.getComponent(cc.Sprite);
        ts.spriteFrame = sf;
    },


    setShowNumber:function(numb){
        this.num = numb;
        this.setShowImg();
    },

    setShowImg:function(){
        let str = 'B_';
        let gmgr = cc.jim.PType;
        if(gmgr === 1){
            str +='bamboo_'
        }else if(gmgr === 2){
            str += 'character_'
        }else if(gmgr === 3){
            str += 'dot_';
        }
        str += this.num;
        let sf = this.zatlas.getSpriteFrame (str);
        let ts = this.node.getComponent(cc.Sprite);
        ts.spriteFrame = sf;
    },
});
