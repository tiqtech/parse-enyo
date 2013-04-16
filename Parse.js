enyo.kind({
    name:"Parse.RestClient",
    kind:"Component",
    statics:{
        key:"Parse.RestClient.User",
        user:null,
        setUser:function(user, applicationId) {
            this.user = user;
            if(localStorage) {
                if(this.user) {
                    localStorage.setItem(this.key+"/"+applicationId, enyo.json.stringify(user));    
                } else {
                    localStorage.removeItem(this.key+"/"+applicationId);
                }
            }
        },
        currentUser:function(applicationId) {
            if(!this.user && localStorage) {
                var s = localStorage.getItem(this.key+"/"+applicationId);
                if(s) {
                    this.user = enyo.json.parse(s);
                }
            }

            return this.user;
        }
    },
    published:{
        applicationId:"",
        key:"",
        keyType: "js"   // or rest
    },
    events:{
        onAdd:"",
        onUpdate:"",
        onGet:"",
        onRemove:"",
        onSearch:"",
        onError:"",
        onCreateUser:"",
        onRemoveUser:"",
        onLogin:"",
        onBatch:""
    },
    handlers:{
        onLogin:"loginHandler"
    },
    parse:{
        host:"api.parse.com",
        version:"1"
    },
    reservedFields: {__type:1, createdAt:1, updatedAt:1, className:1},
    getPath:function(endpoint, className, id) {
        var p = ["",this.parse.version,endpoint];

        if(className) {
            p.push(className);
        }

        if(id) {
            p.push(id);
        }
        
        return p.join("/");
    },
    getAjax:function(config) {
        var params;

        if(this.keyType == "js") {

            var user = Parse.RestClient.currentUser(this.applicationId);

            // map Header attributes into body members
            config.data = enyo.mixin(config.data || {}, {
                _ApplicationId: this.applicationId,
                _ClientVersion: "js1.1.13",
                //_InstallationId: "2dafa3a8-393d-9339-3f96-f2e836b8d1e9"
                _JavaScriptKey: this.key,
                _SessionToken: user ? user.sessionToken : ""
            });

            // all requests are channeled via POST regardless of method
            if(config.method !== "POST") {
                config.data._method = config.method;
                config.method = "POST";
            }

            // stringify the data since we're passing as text/plain
            config.data = enyo.json.stringify(config.data);

            params = {
                method:"POST",
                url:"https://"+this.parse.host+this.getPath(config.endpoint, config.className, config.id),
                cacheBust:false,
                contentType:"text/plain",
            };

        } else {
            params = {
                method:(config.method || "GET").toUpperCase(),
                url:"https://"+this.parse.host+this.getPath(config.endpoint, config.className, config.id),
                //cacheBust:true,
                contentType:"application/json",
                headers:{
                    "X-Parse-Application-Id":this.applicationId,
                    "X-Parse-REST-API-Key":this.key
                }
            };

            var user = Parse.RestClient.currentUser(this.applicationId);
            if(user) {
                params.headers["X-Parse-Session-Token"] = user.sessionToken;
            }
        }

        return new enyo.Ajax(params);
    },
    call:function(config) {
        if(this.batchMode) {
            this.commands.push(config);
            return;
        }

        var x = this.getAjax(config);

        if(config.method === "POST" || config.method === "PUT") {
            x.setPostBody(config.data);
            x.go();
        } else {
            x.go(config.data);
        }

        x.error(this, function(sender, response) {
            var e = {error:"Unknown Error", code:response};

            if(sender.xhrResponse.body) {
                try {
                    enyo.mixin(e, enyo.json.parse(sender.xhrResponse.body));
                } catch(x) {}
            }

            this.doError(e);
            if(config.callback) {
                config.callback(sender, e);
            }
        });

        if(config.event) {
            x.response(this, function(sender, response) {
                var stop = false;
                var e = {
                    response:response,
                    stop:function() {
                        stop = true;
                    }
                };
                
                this[config.event](e);
                
                if(stop) {
                    x.fail();
                } else {
                    return response;
                }
            });
        }

        if(config.callback) {
            x.response(function(sender, response) {
                config.callback(sender, {response:response});
            });
        }
    },
    clean:function(o) {
        if(o) {
            for(var k in this.reservedFields) {
                delete o[k];
            }
        }
    },
    add:function(className, o, callback) {
        this.clean(o);

        this.call({
            endpoint:"classes",
            className:className,
            method:"POST",
            data:o,
            event:"doAdd",
            callback:callback
        });
    },
    get:function(className, id, callback) {
        this.call({
            endpoint:"classes",
            className:className,
            method:"GET",
            id:id,
            event:"doGet",
            callback:callback
        });
    },
    update:function(className, o, callback) {
        this.clean(o);

        this.call({
            endpoint:"classes",
            className:className,
            method:"PUT",
            id:o.objectId,
            data:o,
            event:"doUpdate",
            callback:callback
        });
    },
    search:function(className, query, callback) {
        for(var k in query) {
            if(query[k] instanceof Object) {
                query[k] = enyo.json.stringify(query[k]);
            }
        }

        this.call({
            endpoint:"classes",
            className:className,
            method:"GET",
            data:query,
            event:"doSearch",
            callback:callback
        });
    },
    remove:function(className, id, callback) {
        this.call({
            endpoint:"classes",
            className:className,
            method:"DELETE",
            id:id,
            event:"doRemove",
            callback:callback
        });
    },
    batch:function(commands, callback) {
        if(enyo.isArray(commands)) {
            commands = {requests:commands};
        }

        this.call({
            endpoint:"batch",
            method:"POST",
            data:commands,
            event:"doBatch",
            callback:callback
        });
    },
    batchSession:function(sessionFunction, callback) {
        this.commands = [];
        this.batchMode = true;

        sessionFunction(this);

        var requests = [],
            me = this;

        enyo.forEach(this.commands, function(config) {
            requests.push({
                method:config.method,
                path:me.getPath(config.endpoint, config.className, config.id),
                body:config.data
            });
        });

        this.commands = null;
        this.batchMode = false;
        this.batch({requests:requests}, callback);
    },
    run:function(name, args, callback) {
        this.call({
            endpoint:"functions",
            className:name,
            method:"POST",
            data:args,
            callback:callback
        });
    },
    createUser:function(username, password, data, callback) {
        // remap callback when data is omitted
        if(enyo.isFunction(data)) {
            callback = data;
            data = {};
        }

        enyo.mixin(data, {
            username:username,
            password:password
        });

        this.call({
            endpoint:"users",
            method:"POST",
            event:"doCreateUser",
            data:data,
            callback:enyo.bind(this, "registerHandler", callback, data)
        });
    },
    removeUser:function(id, callback) {
        this.call({
            endpoint:"users",
            method:"DELETE",
            id:id,
            event:"doRemoveUser",
            callback:callback
        });
    },
    requestPasswordReset:function(email, callback) {
        this.call({
            endpoint:"requestPasswordReset",
            method:"POST",
            data:{email:email},
            callback:callback
        });
    },
    login:function(username, password, callback) {
        this.call({
            endpoint:"login",
            method:"GET",
            event:"doLogin",
            data:{username:username, password:password},
            callback:callback
        });
    },
    logout:function() {
        Parse.RestClient.setUser(null, this.applicationId);
    },
    registerHandler:function(callback, data, sender, event) {
        // store session key on successful login
        if(event.response) {
            Parse.RestClient.setUser(enyo.mixin(data, event.response), this.applicationId);
        }

        callback(sender, event);
    },
    loginHandler:function(sender, event) {
        // store session key on successful login
        if(event.response) {
            Parse.RestClient.setUser(event.response, this.applicationId);
        }
    },
    currentUser:function() {
        return Parse.RestClient.currentUser(this.applicationId);
    }
});