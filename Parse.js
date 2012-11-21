enyo.kind({
    name:"Parse.RestClient",
    kind:"Component",
    published:{
        applicationId:"",
        key:""
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
        host:"api.parse.com",
        version:"1"
    },
    getUrl:function(id, endpoint, className) {
        var p = ["https://",this.parse.host,this.parse.version,endpoint,className];
        if(id) {
            p.push(id);
        }
        
        return p.join("/");
    },
    call:function(config) {
        config = enyo.mixin({
            endpoint:"classes",
            method:"GET"
        }, config);
        
        var x = new enyo.Ajax({
            method:config.method,
            url:this.getUrl(config.id, config.endpoint, config.className),
            cacheBust:false,
            contentType:"application/json",
            headers:{
                "X-Parse-Application-Id":this.applicationId,
                "X-Parse-REST-API-Key":this.key
            }
        });
        
        x.go(config.data);
        x.error(this, function(sender, response) {
            this.doError({response:response});
            if(config.callback) {
                config.callback(sender, {
                    error:response
                });
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
    add:function(className, o, callback) {
        this.call({
            className:className,
            method:"POST",
            data:enyo.isString(o) ? o : enyo.json.stringify(o),
            event:"doAdd",
            callback:callback
        });
    },
    get:function(className, id, callback) {
        this.call({
            className:className,
            method:"GET",
            id:id,
            event:"doGet",
            callback:callback
        });
    },
    update:function(className, o, callback) {
        this.call({
            className:className,
            method:"PUT",
            id:o.objectId,
            data:enyo.isString(o) ? o : enyo.json.stringify(o),
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
            className:className,
            method:"GET",
            data:query,
            event:"doSearch",
            callback:callback
        });
    },
    remove:function(className, id, callback) {
        this.call({
            className:className,
            method:"DELETE",
            id:id,
            event:"doRemove",
            callback:callback
        });
    },
    run:function(name, args, callback) {
        this.call({
            endpoint:"functions",
            className:name,
            method:"POST",
            data:args ? enyo.json.stringify(args) : "{}",
            callback:callback
        });
    }
});