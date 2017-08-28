cc.Class({
    extends: cc.Component,

    properties: {
        paixing:cc.Label,
        fan:cc.Label,
        dian:cc.Label,
    },

    showEnd:function(px,f){
        this.paixing.string = px;
        this.fan.string = f+'翻';
        this.dian.string = Math.pow(2,Number.parseInt(f))+'倍';
    },
    
});
