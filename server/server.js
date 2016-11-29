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
        Router.go('login');
      }
    },
    'rejectBlog': function(url){
      var admin = Meteor.user();
      if (admin) {
        return UnapprovedBlogs.remove({url: url});
      } else {
        console.error('user not logged in on client');
        Router.go('login');
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
    'deleteBlog': function(url){
      try {
        return Blogs.remove({url: url});
      }
      catch (e) {
        return alert(e);
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




