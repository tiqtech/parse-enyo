var _Singleton = {
	name:"extras.Singleton",
	kind:"Component",
	root:"extras.singleton.data",
	published:{
		base:"",
	},
	create:function() {
		this.inherited(arguments);
		this.window = enyo.windows.getRootWindow();
		enyo.getObject(this.root, this.window);
	},
	set:function(prop, value) {
		enyo.setObject(this.getPath(prop), value, this.window);
	},
	get:function(prop) {
		return enyo.getObject(this.getPath(prop), false, this.window);
	},
	getPath:function(prop) {
		var r = [this.root];
		if(this.base && this.base.length > 0) {
			r.push(this.base);
		}
		
		r.push(prop);
		
		return r.join(".");
	}
};

enyo.kind(_Singleton);

var _AutoPref = {
	name : "extras.AutoPreferencesService",
	kind : "Component",
	components : [{
		kind : "SystemService",
		name : "getPreferences",
		method : "getPreferences",
		onResponse : "getPrefs"
	}, {
		kind : "SystemService",
		name : "setPreferences",
		method : "setPreferences",
		onResponse : "setPrefs"
	}, {
		kind:"extras.Singleton",
		name:"singleton",
		base:"autoprefs"
	}],
	events : {
		onLoad : "",
		onSet : "",
		onError : ""
	},
	deferUpdate:false,
	create : function() {
		this.inherited(arguments);

		var props = [];
		for ( var prop in this.published) {
			props.push(prop);
			this["get" + enyo.cap(prop)] = enyo.bind(this, "getProp", prop);
			this[prop + "Changed"] = enyo.bind(this, "changeHandler", prop);
		}

		this.$.getPreferences.call({
			keys : props
		});
	},
	getProp:function(prop) {
		var p = this.$.singleton.get(prop);
		
		if(p) {
			this[prop] = p;
			return p;
		} else {
			return this[prop];
		}
	},
	changeHandler : function(prop) {
		if (this.deferUpdate)
			return;
		
		this.$.singleton.set(prop, this[prop]);
		
		var o = {};
		o[prop] = this[prop];
		this.$.setPreferences.call(o);
	},
	defer : function(disable) {
		this.deferUpdate = !!disable;
	},
	update : function() {
		this.$.setPreferences.call(this.serialize());
	},
	serialize:function() {
		var o = {};
		for ( var prop in this.published) {
			o[prop] = this[prop];
		}
		
		return o;
	},
	setPrefs : function(source, response) {
		if (!response.returnValue)
			this.doError(response);

		this.doSet();
	},
	getPrefs : function(source, response) {
		if (!response.returnValue)
			this.doError(response);
		
		for ( var prop in this.published) {
			if(response[prop] !== undefined) {
				this[prop] = response[prop];
			}
		}

		this.doLoad();
	}
}

enyo.kind(_AutoPref);