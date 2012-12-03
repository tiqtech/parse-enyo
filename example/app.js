enyo.kind({
    name:"ex.App",
    components:[
        // add your applicationId and REST key below
        {name:"pds", kind:"Parse.RestClient", applicationId:"", key:""}
    ],
    className:"message",
    create:function() {
        this.inherited(arguments);
        this.start();
    },
    start:function() {
        this.$.pds.add(this.className, {message:"test message"}, enyo.bind(this, "added"));
    },
    added:function(sender, event) {
        this.log(event.response);
        
        this.$.pds.get(this.className, event.response.objectId, enyo.bind(this, "got"));
    },
    got:function(sender, event) {
        this.log(event.response);
        
        event.response.message= "modified message";
        this.$.pds.update(this.className, event.response, enyo.bind(this, "updated"));
    },
    updated:function(sender, event) {
        this.log(event.response);
        
        this.$.pds.search(this.className, {
            sort:"-updatedAt",
            where:{"message":"modified message"}
        }, enyo.bind(this, "found"));
    },
    found:function(sender, event) {
        this.log(event.response);
        
        this.$.pds.remove(this.className, event.response.results[0].objectId, enyo.bind(this, "removed"));
    },
    removed:function(sender, event) {
        this.log(event.response);
        
        this.$.pds.run("echo", {message:"testing function"}, enyo.bind(this, "ran"));
    },
    ran:function(sender, event) {
        this.log(event.response);
        
        this.$.pds.createUser("testuser", "Test@User!", enyo.bind(this, "newUser"));
    },
    newUser:function(sender, event) {
        this.log(event.response);
        
        this.$.pds.login("testuser", "Test@User!", enyo.bind(this, "loggedIn"));
    },
    loggedIn:function(sender, event) {
        this.log(this.$.pds.getSessionToken(), event.response);
        
        this.$.pds.removeUser(event.response.objectId, enyo.bind(this, "removedUser"));
    },
    removedUser:function(sender, event) {
        this.log(event.response);
    }
});       

new ex.App();
        
​