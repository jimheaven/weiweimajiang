cc.Class({
    extends: cc.Component,

    properties: {
        freeP:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        initMgr(this.freeP);
    },


    ALogin:function(){
        cc.director.loadScene("game");
    },

});

function initMgr(freeP) {
    cc.jim = {};

    cc.jim.http = require("HTTP");
    
    
    //cc.jim.http = require("HTTP");
    cc.jim.net = require("Net");

    cc.jim.myInfo = {img:'', name:'',token:'' };

    cc.jim.freeP = freeP;

    cc.jim.PType = 1;

    cc.jim.online = null;

}