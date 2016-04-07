//###############
// Deal with user tokens and authentication

Accounts.onEnrollmentLink(function(token, done){
  try {
    Accounts.verifyEmail(token);
    Session.set('resetToken', token);
  }
  catch (e) {
    console.log('error:' + e);
  }
});

Accounts.onResetPasswordLink(function(token, done){
  try {
    Accounts.verifyEmail(token);
    Session.set('resetToken', token);
  }
  catch (e) {
    console.log('error:' + e);
  }
});
// ################
// field validation settings using themeteorchef:jquery-validation

$.validator.setDefaults({
  rules: {
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minlength: 16
    },
    url: {
      required: true,
      url: true
    },
    feed: {
      required: true,
      url: true
    },
    author: {
      required: true
    },
    type: {
      required: true
    }
  },
  messages: {
    email: {
      required: "You need an email address.",
      email: "That's not an email address!",
    },
    email_again: {
      required: "You need an email address.",
      email: "That's not an email address!",
      equalTo: "Doesn't match!"
    },
    password: {
      required: "You need a passphrase.",
      minlength: "That is a terrible passphrase. Use at least {0} characters."
    },
    url: {
      required: "We can't register your blog without an address!",
      url: "Please enter a valid URL including http://"
    },
    feed: {
      required: "We feel the need. The need, for a feed!",
      url: "Please enter a valid RSS feed including http://"
    },
    author: {
      required: "Please enter an author name"
    },
    type: {
      required: "Please select a category"
    }
  }
});

// ****************
// EVENTS
// ****************

// tokens
Template.home.onRendered(function(){
    var rT = Session.get('resetToken');
    if (rT) {
      Router.go('reset');
    }
});

// STARTUP

  // prevent default behavour
Template.startup.events({
  'submit form': function(event){
    event.preventDefault();
  }
});

  // handle everything else here
Template.startup.onRendered(function(form){
  var template = this;
  template.subscribe('users');
  var validator = $('.register').validate({
    wrapper: "div",
    rules: {
      email: {
        required: true,
        email: true
        },
      email_again: {
        equalTo: "#email1"
      }
    },
    submitHandler: function(){
      var email = $('[name=email]').val();
        Meteor.call('registerAdmin', email, function(error){
          if (error) {
            validator.showErrors({
            email: "They're already registered!"
            }); 
          } else {
            Meteor.call('setPassword', email);
            try {
              Meteor.call('setOwner', email);
            }
            catch (error) {
              console.log('error: ' + error);
            }
            console.log('done!')
          }
        });              
      }
  });
});

// BUTTONS

Template.buttons.events({
  'click #browse-tags': function(event){
    event.preventDefault();
    Router.go('tagsList');
  },
  'click #search': function(event){
    event.preventDefault();
    Router.go('searchBox');
  },
  'click #browse-blogs': function(event){
    event.preventDefault();
    Router.go('findBlogs');
  },
  'click #opml':function(event){
    event.preventDefault();
    Router.go('opml');
  }
});

// LOGIN

Template.login.events({
  'submit form': function(event){
    event.preventDefault();
  },
  'click [id=forgot]': function(event){
    event.preventDefault();
    var email = $('[name=email]').val();
    // call this function to send recovery email. 
    // It calls Accounts.sendResetPasswordEmail, but we don't have to define that. Meteor magic!
    Accounts.forgotPassword({email: email});
    Router.go('forgot');
  }
});
Template.login.onRendered(function(){
  var currentUser = Meteor.user();
  var validator = $('.login').validate({
    wrapper: "div",
    submitHandler: function(event){
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Meteor.loginWithPassword(email, password, function(error){
        if (error){
          // careful with this, it needs to be unclear which one is wrong to help prevent phishing
          if (error.reason == "User not found"){
            validator.showErrors({
            password: "Wrong password, or user not found"   
            });
          }
          if (error.reason == "Incorrect password"){
            validator.showErrors({
               password: "Wrong password, or user not found" 
            });
          }
          else {
            validator.showErrors({
               password: "Error: are you using an old sign-in token?"
            });
          }
        } else {
          var currentRoute = Router.current().route.getName();
            if (currentRoute == "login"){
              Router.go('admin');
            }
          }
      });
        // clear any reset tokens so you can still navigate around if you change your mind abour resetting.
        Session.set('resetToken', '');
    }
  });
});

// REGISTER

  // prevent default behavour
Template.register.events({
  'submit form': function(event){
    event.preventDefault();
  }
});

  // handle everything else here
Template.register.onRendered(function(form){
  var validator = $('.register').validate({
    wrapper: "div",
    rules: {
      email: {
        required: true,
        email: true
        },
      email_again: {
        equalTo: "#email1"
      }
    },
    submitHandler: function(){
      var email = $('[name=email]').val();
        Meteor.call('registerAdmin', email, function(error){
          if (error) {
            validator.showErrors({
            email: "They're already registered!"
            }); 
          } else {
            Meteor.call('setPassword', email);
            Router.go('admin');
          }
        });              
      }
  });
});

Template.registerBlog.events({
  'submit form':function(event){
    event.preventDefault();
  }
});

Template.registerBlog.onRendered(function(form){
  var validator = $('#register-form').validate({
    wrapper: 'div',
    rules: {
      url: {
        required: true,
        url: true
      },
      feed: {
        required: true,
        url: true
      },
      author: {
        required: true
      },
      type: {
        required: true
      }
    },
    submitHandler: function(){
      // get form values
      var fUrl = $('[id=url]').val();
      var fFeed = $('[id=feed]').val();
      var fAuthor = $('[id=author]').val();
      var fTwHandle = $('[id=twHandle]').val();
      var type = $('[id=type]').val();
      //trim whitespace
      var url = $.trim(fUrl);
      var feed = $.trim(fFeed);
      var author = $.trim(fAuthor);
      var twHandle = $.trim(fTwHandle);
      // set email values
      var subj = "new blog suggestion for @ausGLAMblogs";
      var txt = "Someone has made a suggestion for a blog to add to @ausGLAMblogs! \n\nfeed: " + fUrl + "\n\nLog in at https://glamblogs.newcardigan.org to approve/deny.";
      // add the blog feed to the list for approval/rejection
      Meteor.call('addBlog', url, feed, author, twHandle, type, function(error){
        if (error) {
            validator.showErrors();
        } else {
            // send the email to the admin/s listed above
            Meteor.call('sendEmail', subj, txt);
            // load/redirect to the 'success' template
            Router.go('success');
            document.getElementById('register-form').reset();
            document.getElementById('reg-button').blur();
        }
      });    
    }
  });
});

// ADMIN

Template.admin.onRendered(function(){
  var user = Meteor.user();
  var owner = user.profile.owner;
  if (owner) {
    Meteor.subscribe('usersAll');
  }
});

Template.admin.events({
  'click [name=approve]': function(event){
    event.preventDefault();
    var url = event.target.value;
    Meteor.call('approveBlog', url);
  },
  'click [name=reject]': function(event){
    event.preventDefault();
    var url = event.target.value;
    Meteor.call('rejectBlog', url);
  },
  'click #log-out': function(event){
    event.preventDefault();
    Meteor.logout();
  },
  'click #register-user': function(event){
    Router.go('register');
  },
  'click #remove-listing': function(event){
    Router.go('removeListing');
  },
  'click [name=make-owner]': function(event){
    event.preventDefault();
    var email = event.target.value;
    var check = confirm("Are you sure you want to transfer ownership to " + email + "? You will lose ownership privileges.");
    if (check == true) {
      try {
        Meteor.call('setOwner', email);
        var subj = "AusGLAMblogs owner changed";
        var txt = email + " is now the owner of AusGLAMblogs.";
        Meteor.call('sendEmail', subj, txt);     
      }
      catch (e) {
        console.log('error: ' + e)
      }
      try {
        Meteor.call('removePrevOwner', email);      
      }
      catch (e) {
        console.log('error: ' + e)
      }
    }
  }, 
  'click [name=delete-user]': function(event){
    event.preventDefault();
    var email = event.target.value;
    var check = confirm("Are you sure you want to remove " + email + " as an admin?");
    if (check == true) {
      try {
        // we should delete the user and *then* email everyone, but by then they won't be an admin so we'd have to
        // make a new function with the old user's email, which is a pain in the arse
        // doing it this way (email then delete) assumes that if we can't delete them, we probably can't email them either
        // yes I am lazy
        var subj = "AusGLAMblogs admin deleted";
        var txt = email + " has been removed as an admin of AusGLAMblogs.";
        Meteor.call('sendEmail', subj, txt);
        Meteor.call('deleteUser', email);
      } catch (e) {
        console.log(e);
      }      
    }

  }
});

Template.removeListing.events({
  'submit form': function(event){
    event.preventDefault();
    var blog = $('[name=url]').val();
    // You can clean the URLs using the commented-out code below if you did this for everything on the way in.
    // This allows admins to use a trailing slash and have it stripped out.
    // If you didn't clean your URLs on the way in, however, you may not be able to delete listings if you include this.
    // var clean = /\/$/;
    // var url = blog.replace(clean, "");
    Meteor.call('deleteBlog', /*url*/blog);
    Router.go('admin');
  }
});

Template.reset.events({
  'submit form': function(event){
    event.preventDefault();
    var passOne = $('[id=pass-one]').val();
    var passTwo = $('[id=pass-two]').val();
    var token = Session.get('resetToken');
    // we should add a submitHandler here to do this properly, but for now...
    if (passOne === passTwo){
      try {
        Accounts.resetPassword(token, passOne)
      }
      catch (e) {
        console.log('error:' + e)
      }
      document.getElementById('reset-form').reset();
      // clear reset token so you don't end up in a loop.
      Session.set('resetToken', '');
      Router.go('admin');
    } else {
      console.log("error: passwords don't match");
      document.getElementById('reset-form').reset();
    }
  } 
});

Template.footer.events({
  'click [id=admin-button]': function(event){
    event.preventDefault();
    Router.go('admin');
    document.getElementById('admin-button').blur();
  }
});

// SEARCHING AND BROWSING

Template.findBlogs.events({
  'change [id=searchType]': function(event){
    event.preventDefault();
    var type = $('[id=searchType]').val();
    Session.set('showType', type);
  }
});

Template.latest.events({
  'click [name=tag]': function(event){
    event.preventDefault();
    var tagName = event.target.id;
    Session.set("blogCategory", tagName)
    Router.go('tagView');
  }
});

Template.searchBox.events({
  'click [name=tag]': function(event){
    event.preventDefault();
    var tagName = event.target.id;
    Session.set("blogCategory", tagName)
    Router.go('tagView');
  }
});

Template.tagsList.events({
  'click [name=tag]': function(event){
    event.preventDefault();
    var tagName = event.target.id;
    Session.set("blogCategory", tagName)
    Router.go('tagView');
  }
});

// ****************
// HELPERS
// ****************

Template.admin.helpers({
  'approvalList': function(){
    return UnapprovedBlogs.find()
  },
  'owner': function(){
    var id = Meteor.userId();
    var check = Meteor.call('checkOwner', id);
    if (check == true) {
      return true
    } else {
      return false
    }
  },
  'users': function(){
    return Meteor.users.find();
  },
  'notOwner': function() {
    if (this._id != Meteor.userId()) {
      return true
    }
  }
});

Template.findBlogs.helpers({
  'showBlogs': function(){
    var type = Session.get('showType');
    if (type) {
      if (type === "all") {
      return Blogs.find({approved: true}, {sort:{url: 1}})
      } else {
        return Blogs.find({approved: true, type: type}, {sort:{url: 1}})
      }
    } else {
    return Blogs.find({approved: true}, {sort:{url: 1}})
    } 
  },
  'cleanURL': function(x) {
    // removes trailing slashes and preceding http etc
    var cleanup = /http:\/\/|https:\/\/|\/+$/ig;
    var cleaned = x.replace(cleanup, "");
    return cleaned;
  }
});

Template.home.helpers({
  'totalBlogs': function () {
    var allBlogs = Blogs.find(); 
    return allBlogs.count();
  },
  'totalArticles': function () {
    var allArticles = Articles.find();
    return allArticles.count()
  },
  'totalTags': function () {
    var allTags = Tags.find();
    return allTags.count()
  }
});

Template.latest.helpers({
  latest: function(){
    return Articles.find({},{sort: {date: -1},limit:10});
  }
});

Template.searchBox.helpers({
  myAttributes: function(){
    var attributes = {placeholder: "Find posts about...", class:"search-input", id:"search-box", autofocus:"true"};
    return attributes
  },
    getQuery: function(){
    var term = document.getElementById('search-box');
    return term.value
  },
  articlesIndex: () => BlogsIndex
});

Template.tagsList.helpers({
  tagList: function(){
    return Tags.find({},{sort:{total:-1}});
  },
  mostPopular: function(){
    var mP = Tags.findOne({},{sort:{total:-1}});
    Session.set("topTag", mP.total)
    return mP.total;
  },
  tagPercent: function(tagTotal){
    var total = Session.get("topTag");
    var result = (tagTotal * 100)/total;
    return result
  }
});

Template.tagView.helpers({
  tagBrowse: function(){
    var tag = Session.get("blogCategory");
    return Articles.find({categories:{$in: [tag]}},{sort:{date:-1}})
  },
  tagTitle: function(){
    var tagName = Session.get("blogCategory");
    return tagName;
  },
  tagDate: function(date){
    var options = {year: 'numeric', month: 'short', day: 'numeric'};
    niceDate = date.toLocaleString('en-AU', options);
    return niceDate;
  }
});

// SUBSCRIPTIONS

Meteor.subscribe('blogs');
Meteor.subscribe('uBlogs');
Meteor.subscribe('tags');
Meteor.subscribe('articles');