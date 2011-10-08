var _Parse = {
	name:"com.parse.RestClient",
	kind:"Component",
	published:{
		applicationId:"",
		//clientKey:"",
		masterKey:"",
		className:""
	},
	events:{
		onAdd:"",
		onUpdate:"",
		onGet:"",
		onRemove:"",
		onSearch:"",
		onError:""
	},
	parse:{
		host:"https://api.parse.com",
		path:"1/classes"
	},	
	components:[
        {name:"ws", kind:"WebService", contentType:"application/json", onSuccess:"callSuccess", onFailure:"callFailure"}
    ],
    create:function() {
    	this.inherited(arguments);
    	this.applicationIdChanged();
    	this.masterKeyChanged();
    },
    applicationIdChanged:function() {
    	this.$.ws.setUsername(this.applicationId);
    },
    masterKeyChanged:function() {
    	this.$.ws.setPassword(this.masterKey);
    },
    setUrl:function(id) {
    	var p = [this.parse.host,this.parse.path,this.className];
    	if(id) p.push(id);
    	
    	this.$.ws.setUrl(p.join("/"));
    },
    call:function(method, data, successEvent) {
    	this.$.ws.setMethod(method);
    	var request = this.$.ws.call(data && enyo.json.stringify(data));
    	request.__callback = successEvent;
    },
    callSuccess:function(source, response, request) {
    	this[request.__callback](response);
    },
    callFailure:function(source, response, request) {
    	enyo.log("failure!")
    	this.doError(request);
    },
    add:function(o) {
    	this.setUrl();
    	this.call("POST", o, "doAdd");
    },
    get:function(id) {
    	this.setUrl(id);
    	this.call("GET", undefined, "doGet");
    },
    update:function(id, o) {
    	this.setUrl(id);
    	this.call("PUT", o, "doUpdate");
    },
    search:function(query) {
    	this.setUrl();
    	this.$.ws.setUrl(this.$.ws.getUrl() + "?where=" + enyo.json.stringify(query));
    	this.call("GET", undefined, "doSearch");
    },
    remove:function(id) {
    	this.setUrl(id);
    	this.call("DELETE", undefined, "doRemove");
    }
};

enyo.kind(_Parse);