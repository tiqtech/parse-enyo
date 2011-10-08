enyo.kind({
	name:"PreferencesService",
	kind:"extras.AutoPreferencesService",
	published:{
		user:""
	}
});

var _Example = {
	name:"ParseExample",
	kind:"VFlexBox",
	components:[
        {kind:"Button", name:"register", caption:$L("Register"), onclick:"registerClicked", disabled:true},
        {kind:"VirtualList", name:"messages", flex:1, onSetupRow:"setupMessageRow", components:[
        	{kind:"Control", name:"messageText"}
    	]},
        {kind:"HFlexBox", components:[
	        {kind:"Input", name:"message", flex:1, hint:$L("Tap to enter a message")},
	        {kind:"Button", name:"send", caption:$L("Send"), disabled:true, onclick:"sendClicked"}
        ]},
        {kind:"com.parse.RestClient", name:"parse", className:"Message", onSearch:"foundMessages", onAdd:"messageSaved", onError:"parseError", applicationId:"", masterKey:""},
        {kind:"com.parse.RestClient", name:"user", className:"User", onAdd:"userCreated", onError:"userCreateError", applicationId:"", masterKey:""},
        {kind:"PreferencesService", name:"prefs", onLoad:"prefsReady"}
    ],
    constructor:function() {
    	this.inherited(arguments);
    	this.messages = [];    	
    },
    create:function() {
    	this.inherited(arguments);
    	this.prefsReady();
    },
    prefsReady:function() {
    	this.user = this.$.prefs.getUser();
    	if(!this.user) {
    		this.$.register.setDisabled(false);
    	} else {
    		this.$.register.setDisabled(true);
    		this.$.register.setCaption("Registered as " + this.user);
    		this.$.send.setDisabled(false);
    		this.loadMessages();
    	}
    },
    setupMessageRow:function(source, index) {
    	var m = this.messages[index];
    	if(m) {
	    	this.$.messageText.setContent(this.messages[index].message);
	    	
	    	// indicate pending messages
	    	if(!m.objectId) {
	    		this.$.messageText.applyStyle("color", "#444");
	    	}
	    	
	    	return true;
    	}
    },
    registerClicked:function() {
    	this.$.user.add({name:"Sir Parsalot"});
    },
    userCreated:function(source, response) {
    	this.$.prefs.setUser(response.objectId);
    	this.prefsReady();
    },
    userCreateError:function() {
    	enyo.log("error registering user");
    },
    loadMessages:function() {
    	this.$.parse.search({"sender":this.user});
    },
    foundMessages:function(source, response) {
    	this.messages = response.results;
    	this.$.messages.refresh();
    },
    sendClicked:function() {
    	var message = this.$.message.getValue();
    	if(message.length > 0) {
    		var m = {sender:this.user, message:message};
    		this.$.parse.add(m);
    		this.messages.push(m);
    		this.$.message.setValue("");
    	}
    },
    messageSaved:function() {
    	// should just refresh the pending items but this is only an example, right?
    	this.$.messages.refresh();
    }
};

enyo.kind(_Example);