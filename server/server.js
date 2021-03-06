/* #####################################################################
    CommunityTweets - a meteor app to index and tweet blog posts
    Copyright (C) 2017  Hugh Rundle

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    You can contact Hugh on Twitter @hughrundle 
    or email hugh [at] hughrundle [dot] net
  #####################################################################*/

// ###############
// SETUP
// ###############

Accounts.emailTemplates.siteName = "newCardigan GLAM Blogs";
Accounts.emailTemplates.from = "GLAM Blogs alertBot <alerts@newcardigan.org>";

// Uncomment the lines below to set up email on startup
// Requires a Mailgun account
// Only needed for dev testing on a local machine
// for productions set MAIL_URL as part of your startup script

// Meteor.startup( () => {
//   process.env.MAIL_URL = "smtp://postmaster@mg1.your-domain.tld:yourtoken@smtp.mailgun.org:587/";
// });

//  #############################
//  METHODS
//  #############################
  Meteor.methods({
    'addBlog': function(url, feed, author, twHandle, type){
      // create an unapproved entry in the Blogs collection.
      var clean = /\/$/;
      var cUrl = url.replace(clean, "");
      return UnapprovedBlogs.upsert({url: cUrl}, {url: cUrl, feed: feed, author: author, twHandle: twHandle, type: type, approved: false});
     },
     'sendEmail': function(subj, txt){
      // send the email to all admins (i.e. all registered users)
      var admins = Meteor.users.find();
      admins.forEach(function(user){
        var address = user.emails[0].address;
        try {
            return Email.send({
            from: "'newCardigan alertBot' <hello@newcardigan.org>",
            to: address,
            subject: subj,
            text: txt
          });        
        }
        catch (error) {
          console.error('error sending email: ' + error);
        }
      });
    },
    'approveBlog': function(url){
      var admin = Meteor.user();
      if (admin) {
        try { 
          var unapproved = UnapprovedBlogs.findOne({url:url});
          Blogs.upsert({url: url}, {$set:{feed: unapproved.feed, author: unapproved.author, twHandle: unapproved.twHandle, type: unapproved.type, approved: true, announced: false, failing: false}});
          return UnapprovedBlogs.remove({url:url});
        } catch (error) {
          // TODO make this go to a proper error page/pop-over
          console.error("error approving blog: " + error)
        }
      } else {
        console.error('user not logged in on client');
      }
    },
    'rejectBlog': function(url){
      var admin = Meteor.user();
      if (admin) {
        return UnapprovedBlogs.remove({url: url});
      } else {
        console.error('user not logged in on client');
      }
    },
    'registerAdmin': function(email) {
      return  Accounts.createUser({email: email});
    },
    'setPassword': function(email){
      var newUser = Accounts.findUserByEmail(email);
      var userId = newUser._id;
      try {
        return Accounts.sendEnrollmentEmail(userId);          
      }
      catch (e) {
        return console.error('error setting password: ' + e);
      }
    },
    'verify': function(email){
      var newUser = Accounts.findUserByEmail(email);
      var userId = newUser._id;
      try {
        return Accounts.sendVerificationEmail(userId);          
      }
      catch (e) {
        return console.error('error verifying email: ' + e);
      }
    },
    'setOwner': function(email){
      var newOwner = Accounts.findUserByEmail(email);
      var userId = newOwner._id;
      try {
        return Meteor.users.update({_id: userId}, {$set:{profile:{owner: true}}});          
      }
      catch (e) {
        return console.log('error setting owner: ' + e);
      }
    },
    'removePrevOwner': function(email){
      var newOwner = Accounts.findUserByEmail(email);
      var userId = newOwner._id;
      var owners = Meteor.users.find({profile:{owner:true}});
      owners.forEach(function(user){
        if (user._id !== userId) {
          var id = user._id;
          return Meteor.users.update({_id: id}, {$set:{profile:{owner:false}}});
        }
      });      
    },
    'deleteUser': function(email){
      var user = Accounts.findUserByEmail(email);
      var id = user._id;
      try {
        return Meteor.users.remove({_id: id});        
      }
      catch (e) {
        return console.error('error deleting user ' + e);
      }
    },
    'deleteBlog': function(id){
      try {
        return Blogs.remove({_id: id});
      }
      catch (e) {
        return alert(e);
      }
    },
    'updateBlog': function(id, url, feed, author, twHandle, type){
      var clean = /\/$/;
      var cUrl = url.replace(clean, "");
      try {
        return Blogs.upsert({_id: id}, {$set:{url: cUrl, feed: feed, author: author, twHandle: twHandle, type: type}});
      }
      catch(e) {
        return alert(e);
      }
    },
    'requestPocket': function(){
      // make initial (sync) call to get request token
      const pocketConsumerKey = Meteor.settings.POCKET_KEY;
      // CHANGE THIS TO YOUR OWN URL FOR PRODUCTION
      const pocketRedirectUrl = "http://localhost:3000/pocket-authentication";
      try {
        // we run as sync so it will return any response
        return HTTP.call("POST", "https://getpocket.com/v3/oauth/request", 
          {data:{"consumer_key": pocketConsumerKey, "redirect_uri": "http://glamblogs.newcardigan.org"},
          headers:{"X-Accept":"application/json", "Content-Type":"application/json; charset=UTF8"}
        });
      } catch (error) {
        console.error(error)
      }
    },
    'authorisePocket': function(code){
      const pocketConsumerKey = Meteor.settings.POCKET_KEY;
      console.log(pocketConsumerKey);
      console.log(code);
      return HTTP.call("POST", "https://getpocket.com/v3/oauth/authorize", 
        {data:{"consumer_key": pocketConsumerKey, "code": code},
        headers:{"X-Accept":"application/json", "Content-Type":"application/json; charset=UTF8"}
    });
    },
    'storePocketCredentials': (accessToken, username) => {
      try {
        return Pockets.upsert({username: username}, {$set:{accessToken: accessToken}});
      } catch (e) {
        console.error(e)
      }
    }
});

//  #############
//  Publish
//  #############

Meteor.publish("blogs", function() {
  return Blogs.find();
});

Meteor.publish("uBlogs", function() {
  return UnapprovedBlogs.find();
});

Meteor.publish('users', function(){
  // only publish user IDs - this is only subscribed by 'startup' so should be reasonably safe
  return Meteor.users.find({}, {_id:1});
});

Meteor.publish('usersAll', function(){
    return Meteor.users.find();
});

Meteor.publish('articles', function(){
    return Articles.find();
});

Meteor.publish('tags', function(){
    return Tags.find();
});




