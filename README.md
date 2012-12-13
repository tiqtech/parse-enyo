# What's Parse
It's a rather nice Backend-as-a-Service that'll store your JSON objects away for you. It also has a Cloud Code service which allows you to execute some server-side business logic right next to your data for efficiency and encapsulation.

# What's this lib do?
Parse provides a fully functional JavaScript SDK but it leverages Backbone and I don't like to mix frameworks. This lib will likely always be a bit behind what the JavaScript SDK provides but it will always be more Enyo-ee.

# Supported Features
* CRUD on Objects
* Users
  * Creating
  * Removing
  * Logging In (and persising that login via localStorage)
* Executing Cloud Code modules

# Quick Example
    // assuming I have Parse.RestClient component named parse
    addJoe:function() {
        this.$.parse.add("contact", {name:"joe", phone:"123-456-7890", email:"joe@joe.com"}, enyo.bind(this, "joeAdded"));
    },
    joeAdded:function(source, event) {
        if(event.response) {
            this.log("Joe added with id", event.response.objectId);
        } else {
            this.log(event.error);
        }
    }