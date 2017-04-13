//############################################################
// 
//          User tokens and authentication
// 
//############################################################

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

//############################################################
// 
// Form validation settings using themeteorchef:jquery-validation
// 
//############################################################


$.validator.setDefaults({
  rules: {
    email: {
      required: true,
      email: true
    },
    password: {
      required: false,
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

$.validator.addMethod("password_match", function(value, element) {
  return $('#pass-one').val() === $('#pass-two').val() 
}, "Passwords don't match!");

//############################################################
// 
//                            EVENTS
// 
//############################################################


// HOME

Template.home.onRendered(function(){
    window.scrollTo(0, 0);
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

// LOGIN

Template.login.onRendered(() => {
  window.scrollTo(0, 0);
  document.getElementById("login-email").focus();
  if (Meteor.userId()) {
     Router.go('admin');
  } else {
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
  }
});

Template.login.events({
  'click #forgot': (event) => {
    event.preventDefault();
    Router.go('forgot');
  }
})

// FORGOT PASSWORD

Template.forgot.onRendered( () => {
    var validator = $('.login').validate({
      wrapper: "div",
      rules: {
        password: {
          required: false
        }
      },
      submitHandler: () => {
        // call this function to send recovery email. 
        // It calls Accounts.sendResetPasswordEmail, but we don't have to define that. Meteor magic!
        let email = $('[name=email]').val();
        Accounts.forgotPassword({email: email}, (err) => {
          if (err) {
            console.log(err);
            validator.showErrors();
          } else {
            Router.go('forgotSent');
          }
        });
      }
    })
});

// REGISTER USER

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

// REGISTER BLOG

Template.registerBlog.events({
  'submit form':function(event){
    event.preventDefault();
  }
});

Template.registerBlog.onRendered(function(form){
  window.scrollTo(0, 0);
  document.getElementById("url").focus();
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
        }
      });    
    }
  });
});

// ADMIN

Template.admin.onRendered(function(){
  window.scrollTo(0, 0);
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
  'click #edit-listing': function(event){
    Router.go('editListings');
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

// EDIT/DELETE LISTING

Template.editListings.events({
  'click [class=feeds-list]': () => {
    var selectedBlog = event.target.id;
    console.log(selectedBlog);
    Session.set('editBlogId', selectedBlog)
    Router.go('editListing')
  }
});

Template.editListing.onRendered(function(form){
  window.scrollTo(0, 0);
  document.getElementById("url").focus();
  var validator = $('#edit-form').validate({
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
      // get id
      var id = Session.get('editBlogId');
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
      Meteor.call('updateBlog', id, url, feed, author, twHandle, type, function(error){
        if (error) {
            validator.showErrors();
        } else {
          // load/redirect to the 'admin' template
          Router.go('admin');
          document.getElementById('edit-form').reset();
        }
      });    
    }
  });
});

Template.editListing.events({
  'submit form':function(event){
    event.preventDefault();
  },
  'click #blog-update-button': (event) => {
    event.preventDefault();
    // change id to 'update-confirm'
    // this builds in a safety check
    $('#blog-update-button').attr('id', 'blog-update-confirm-button');
    $('#blog-update-confirm-button').text('Confirm Update')
  },
  'click #blog-delete-button': (event) => {
    event.preventDefault();
    // change id to 'delete-confirm'
    // this builds in a safety check
    $('#blog-delete-button').attr('id', 'blog-delete-confirm-button');
    $('#blog-delete-confirm-button').text('Confirm Deletion')
  },  
  'click #blog-delete-confirm-button': (event) => {
    event.preventDefault();
    var id = Session.get('editBlogId');
    Meteor.call('deleteBlog', id, (error) => {
      if (error) {console.error(error)};
    });
    Router.go('admin');
  }
});

// RESET PASSWORD

Template.reset.onRendered( () => {
  window.scrollTo(0, 0);
  document.getElementById('pass-one').focus();
  var validator = $('#reset-form').validate({
    wrapper: 'div',
    rules: {
      'pass-one': {
        minlength: 16,
        required: true
      },
      'pass-two': {
        required: true,
        'password_match': true
      }
    },
    submitHandler: (event) => {
      let passOne = $('[id=pass-one]').val();
      let token = Session.get('resetToken');
      Accounts.resetPassword(token, passOne, (err) => {
        if (err) {
          if (err.reason === "Token expired") {
            validator.showErrors({
              'pass-two': "Reset token has expired - have you already used it?"
            })
          }
          validator.showErrors();
        } else {
        // clear reset token
        Session.set('resetToken', '');
        Router.go('admin'); 
        }
      })     
    }
  })
});

// FIND BLOGS

Template.findBlogs.events({
  'change [id=searchType]': function(event){
    event.preventDefault();
    var type = $('[id=searchType]').val();
    Session.set('showType', type);
  }
});

// GET LATEST POSTS

Template.latest.events({
  'click [name=tag]': function(event){
    event.preventDefault();
    var tagName = event.target.id;
    Session.set("blogCategory", tagName)
    Router.go('tagView');
  }
});

// SEARCH BOX

Template.searchBox.onRendered(
    () => document.getElementById("search-box").focus()
  );

Template.searchBox.events({
  'click [name=tag]': function(event){
    event.preventDefault();
    var tagName = event.target.id;
    Session.set("blogCategory", tagName)
    Router.go('tagView');
  }
});

// TAG LIST

Template.tagsList.events({
  'click [name=tag]': function(event){
    event.preventDefault();
    var tagName = event.target.id;
    Session.set("blogCategory", tagName)
    Router.go('tagView');
  }
});

//############################################################
// 
//                            HELPERS
// 
//############################################################

// HOME

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

// ADMIN

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

// EDIT LISTINGS

Template.editListings.helpers({
  'showBlogs': () => {
    return Blogs.find({approved: true}, {sort:{url: 1}})
  },
  'cleanURL': (x) => {
    // removes trailing slashes and preceding http etc
    var cleanup = /http:\/\/|https:\/\/|\/+$/ig;
    var cleaned = x.replace(cleanup, "");
    return cleaned;
  }
});

Template.editListing.helpers({
  url: () => {
    var blog_id = Session.get('editBlogId');
    return Blogs.findOne({_id: blog_id}).url;
  },
  feed: () => {
    var blog_id = Session.get('editBlogId');
    return Blogs.findOne({_id: blog_id}).feed;
  },
  author: () => {
    var blog_id = Session.get('editBlogId');
    return Blogs.findOne({_id: blog_id}).author;
  },
  twHandle: () => {
    var blog_id = Session.get('editBlogId');
    return Blogs.findOne({_id: blog_id}).twHandle;
  },
  type: (choice) => {
    var blog_id = Session.get('editBlogId');
    var thisType = Blogs.findOne({_id: blog_id}).type;
    if (choice === thisType) return "selected";
  }  
});

// FIND BLOGS

Template.findBlogs.helpers({
  'showBlogs': () => {
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
  'cleanURL': (x) => {
    // removes trailing slashes and preceding http etc
    var cleanup = /http:\/\/|https:\/\/|\/+$/ig;
    var cleaned = x.replace(cleanup, "");
    return cleaned;
  }
});

// LATEST

Template.latest.helpers({
  latest: function(){
    return Articles.find({},{sort: {date: -1},limit:10});
  }
});

Template.searchBox.helpers({
  myAttributes: function(){
    var attributes = {placeholder: "", class:"search-input", id:"search-box", autofocus:"true"};
    return attributes
  },
    getQuery: function(){
    var term = document.getElementById('search-box');
    return term.value
  },
  articlesIndex: () => BlogsIndex
});

// TAGS LIST

Template.tagsList.helpers({
  tagList: () => {
    // get the tag collection
    let tags = Tags.find({},{sort:{total:-1}});
    // turn it into an array
    let newTags = tags.map((o) => {
      return o;
    });
    // filter out 'uncategorized'
    var cleanTags = newTags.filter((o) => {
      if (o.tag !== "uncategorized") {
        return o;
      }
    });
    return cleanTags;
  },
  mostPopular: () => {
    // find the total for the most popular tag so we can use it to calculate percentages in tagPercent
    var mP = Tags.findOne({},{sort:{total:-1}});
    Session.set("topTag", mP.total)
    return mP.total;
  },
  tagPercent: (n) => {
      let total = Session.get("topTag");
      let result = (n * 100)/total;
      return result;
  },
});

// TAG VIEW

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

//############################################################
// 
//                            SUBSCRIPTIONS
// 
//############################################################

Meteor.subscribe('blogs');
Meteor.subscribe('uBlogs');
Meteor.subscribe('tags');
Meteor.subscribe('articles');