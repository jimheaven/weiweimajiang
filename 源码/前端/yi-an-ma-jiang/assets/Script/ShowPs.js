cc.Class({
    extends: cc.Component,

    properties: {
        atlas:cc.SpriteAtlas,
        num1:cc.Node,
        num2:cc.Node,
        _index:0,
        _showPList:[],
    },

    // use this for initialization
    onLoad: function () {
        
    },

    init:function(){
        this._index = 0;
        this._showPList = [];
        let num1cd = this.num1.children;
        for(let n1 in num1cd){
            num1cd[n1].active = false;
        }

        let num2cd = this.num2.children;
        for(let n2 in num2cd){
            num2cd[n2].active = false;
        }

    },

    containtShowNum:function(num){
        return this._showPList.indexOf(num) != -1;
    },



    show:function(num,ispeng,hande,me){
        if(typeof(hande) != 'undefined')
        {
            let i = this._showPList.indexOf(num);
            if(hande){
                if(!this.containtShowNum(num)){
                    //暗杠
                    let cn = null;
                    if(this._index == 0){
                        cn = this.num1;
                    }else if(this._index == 1){
                        cn = this.num2;
                    }
                    this._index ++;
                    cn.active = true;
                    let cd = cn.children;
                    let showCount = 4;
                    for(let index=0; index<showCount; index++){
                        cd[index].active = true;
                        let str = '';
                        if(me){
                            let gmgr = cc.jim.PType;
                            str = 'B_';
                            if(gmgr === 1){
                                str +='bamboo_'
                            }else if(gmgr === 2){
                                str += 'character_'
                            }else if(gmgr === 3){
                                str += 'dot_';
                            }
                            str += num;
                        }else{
                            str = 'e_mj_b_up';
                        }
                        let sf = this.atlas.getSpriteFrame (str);
                        let ts = cd[index].getComponent(cc.Sprite);
                        ts.spriteFrame = sf;
                        this._showPList.push(num);
                    }
                }else{
                    //追杠
                    let cn = null;
                    if(i == 0){
                        cn = this.num1;
                    }else if(i == 1){
                        cn = this.num2;
                    }
                    let cd = cn.children;
                    cd[3].active = true;
                    let gmgr = cc.jim.PType;
                    let str = 'B_';
                    if(gmgr === 1){
                        str +='bamboo_'
                    }else if(gmgr === 2){
                        str += 'character_'
                    }else if(gmgr === 3){
                        str += 'dot_';
                    }
                    str += num;
                    let sf = this.atlas.getSpriteFrame (str);
                    let ts = cd[3].getComponent(cc.Sprite);
                    ts.spriteFrame = sf;
                }
            }else{
                //明杠
                let cn = null;
                if(this._index == 0){
                    cn = this.num1;
                }else if(this._index == 1){
                    cn = this.num2;
                }
                this._index ++;
                cn.active = true;
                let cd = cn.children;
                let showCount = 4;
                for(let index=0; index<showCount; index++){
                    cd[index].active = true;
                    let gmgr = cc.jim.PType;
                    let str = 'B_';
                    if(gmgr === 1){
                        str +='bamboo_'
                    }else if(gmgr === 2){
                        str += 'character_'
                    }else if(gmgr === 3){
                        str += 'dot_';
                    }
                    str += num;
                    let sf = this.atlas.getSpriteFrame (str);
                    let ts = cd[index].getComponent(cc.Sprite);
                    ts.spriteFrame = sf;
                    this._showPList.push(num);
                }
            }
        }else{
            let cn = null;
            if(this._index == 0){
                cn = this.num1;
            }else if(this._index == 1){
                cn = this.num2;
            }
            this._index ++;
            cn.active = true;
            let cd = cn.children;
            let showCount = 0;
            if(ispeng){
                showCount = 3;
            }else{
                showCount = 4;
            }
            for(let index=0; index<showCount; index++){
                cd[index].active = true;
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
                let ts = cd[index].getComponent(cc.Sprite);
                ts.spriteFrame = sf;
                this._showPList.push(num);
            }
        }
    },
});
