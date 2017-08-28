var MyPush = require('./MyPush');
var P = require('./P');
var ShowPs = require('./ShowPs');
var ReqRsp = require('./ReqRsp');

cc.Class({
    extends: cc.Component,

    properties: {
        myPush:MyPush,
        myShow:ShowPs,
        myPs:[P],
        handP:P,
        peng:cc.Node,
        gang:cc.Node,
        hu:cc.Node,
        _otherPushNum:0,
    },

    
    onLoad: function () {

    },

    init:function(){
    	for(let index in this.myPs){
    		this.myPs[index].node.active = false;
    	}
    	this.handP.node.active = false;
    	this.handP.num = 0;
    	this.hideCaozuo();
    	this.myShow.init();
    	this.myPush.init();
    },

    //初始化
    initPs:function(list){
    	this.handP.node.active = false;
    	this.handP.num = 0;
    	for(let key in list){
    		this.myPs[key].setNumber(list[key]);
    		this.myPs[key].node.active = true;
    	}
    },

    pullP:function(num,caozuo,end){
    	this.handP.node.active = true;
    	this.handP.setNumber(num);
    	this.hideCaozuo();
    	if(caozuo.gang && !end){
    		this.gang.active = true;
    	}
    	if(caozuo.hu){
    		this.hu.active = true;
    	}
    },

    pushP:function(num){
    	let ChooseHP = this.handP.node.getComponent('ChooseP');
    	if(this.handP.num != num || ChooseHP._freeNode == null){
    		for(let index in this.myPs){
    			if(this.myPs[index].num == num){
    				let ChooseP = this.myPs[index].node.getComponent('ChooseP');
    				if(ChooseP._freeNode != null){
    					ChooseP.endMove();
    					this.myPs[index].node.active = false;
            			this.myPs[index].num = 0;
            			break;
    				}
    			}
    		}
    		this.sortPs();
    		this.insertP(this.handP.num);
    	}else{
    		let ChooseP = this.handP.node.getComponent('ChooseP');
    		ChooseP.endMove();
    	}
    	this.handP.node.active = false;
    	this.handP.num = 0;
    	this.myPush.push(num);
    	this.hideCaozuo();
    },

    //碰牌，界面上做处理
    pengP:function(num){
    	let times = 2;
    	for(let index in this.myPs){
    		if(this.myPs[index].num == num){
    			this.myPs[index].node.active = false;
            	this.myPs[index].num = 0;
            	times--;
    		}
    		if(times == 0){
    			this.sortPs();
    			break;
    		}
    	}
    	this.myShow.show(num,true);
    	this.hideCaozuo();
    },

    //杠牌，界面上做处理
    gangP:function(num,hand,peng){
    	let ag = (hand && !peng);
    	if(hand){
    		if(peng){
    			//隐藏一张
    			if(num == this.handP.num){
    				//直接隐藏
    				this.handP.node.active = false;
    				this.handP.num = 0;
    			}else{
    				//找出底牌中的杠牌
    				for(let index in this.myPs){
    					if(this.myPs[index].num == num){
    						this.myPs[index].node.active = false;
            				this.myPs[index].num = 0;
            				break;
    					}
    				}
    				this.sortPs();
    				this.insertP(this.handP.num);
    			}
    			this.myShow.show(num,false,hand,ag);
    			this.hideCaozuo();
    			
    		}else{
    			//隐藏
    			if(num != this.handP.num){
    				this.sortPs();
    				this.insertP(this.handP.num);
    			}
    			for(let index in this.myPs){
    				if(this.myPs[index].num == num){
    					this.myPs[index].node.active = false;
            			this.myPs[index].num = 0;
    				}
    			}
    			this.myShow.show(num,false,hand,ag);
    			this.hideCaozuo();
    			this.handP.node.active = false;
    			this.handP.num = 0;
    		}
    		this.sortPs();
    	}else{
    		for(let index in this.myPs){
    			if(this.myPs[index].num == num){
    				this.myPs[index].node.active = false;
            		this.myPs[index].num = 0;
    			}
    		}
    		this.myShow.show(num,false,ag);
    		this.hideCaozuo();
    		this.sortPs();
    	}

    },

    showAll:function(list){
    	this.handP.node.active = false;
        for(let index in this.myPs){
            this.myPs[index].node.active = false;
            this.myPs[index].num = 0;
        }
        for(let key in list){
            this.myPs[index].node.active = true;
            this.myPs[index].setShowNumber(list[index]);
        }
    },

    sortPs:function(){
    	for(let i=6;i>=0;i--){
    		if(this.myPs[i].num == 0){
    			for(let j = i-1;j>=0;j--){
    				if(this.myPs[j].num != 0){
    					this.myPs[i].setNumber(this.myPs[j].num);
    					this.myPs[j].num = 0;
    					this.myPs[i].node.active = true;
    					this.myPs[j].node.active = false;
    					break;
    				}
    			}
    		}
    	}
    },

    insertP:function(num){
    	for(let i=6;i>=0;i--){
    		if(this.myPs[i].num == 0){
    			if(i - 1 >= 0){
    				if(this.myPs[i - 1].num > num){
    					this.myPs[i].setNumber(this.myPs[i - 1].num);
    					this.myPs[i].node.active = true;
    					this.myPs[i - 1].num = 0;
    					this.myPs[i - 1].node.active = false;
    				}else{
    					this.myPs[i].setNumber(num);
    					this.myPs[i].node.active = true;
    					break;
    				}
    			}else{
    				this.myPs[i].setNumber(num);
    				this.myPs[i].node.active = true;
    				break;
    			}
    			
    		}else{
    			if(this.myPs[i].num < num){
    				let temp = this.myPs[i].num;
    				this.myPs[i].setNumber(num);
    				num = temp;
    			}
    		}
    	}
    },

    myTurn:function(num,caozuo,end){
    	this._otherPushNum = num;
    	this.peng.active = caozuo.peng;
    	this.gang.active = (caozuo.gang && !end);
    	this.hu.active = caozuo.hu;
    },

    hideOneShowP:function(){
        this.myPush.hideOneShowP();
    },

    hideCaozuo:function(){
    	this.peng.active = false;
    	this.gang.active = false;
    	this.hu.active = false;
    },

    pengButton:function(){
    	this.hideCaozuo();
    	cc.jim.net.send(ReqRsp.allRequist.Peng,{ num:this._otherPushNum });
    },

    gangButton:function(){
    	this.hideCaozuo();
    	if(this.handP.node.active){
    		cc.jim.net.send(ReqRsp.allRequist.Gang,{ num:this.handP.num });
    	}else{
    		cc.jim.net.send(ReqRsp.allRequist.Gang,{ num:this._otherPushNum });
    	}
    },

    huButton:function(){
    	this.hideCaozuo();
    	cc.jim.net.send(ReqRsp.allRequist.Hu,{ num:this._otherPushNum });
    },
    
});
