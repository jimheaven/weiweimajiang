cc.Class({
    extends: cc.Component,

    properties: {
        dian:cc.Label,
        _times:0,
    },

    // use this for initialization
    onLoad: function () {
        this.schedule(this.init,1);
    },

    init:function () {
        this._times ++;
        this._times = this._times % 6;
        this.dian.string = '.';
        for(let i = 0;i<this._times;i++){
            this.dian.string += '.';
        }

    }
    
});
