
// COLLECTIONS

Blogs = new Meteor.Collection('blogs');
UnapprovedBlogs = new Meteor.Collection('uBlogs');
Articles = new Meteor.Collection('articles');
Tags = new Meteor.Collection('tags');
Tweets = new Meteor.Collection('tweets');
Pockets = new Meteor.Collection('pockets');

Meteor.users.deny({
  update: function() {
    return true;
  },
  insert: function() {
  return true;
  },
});

// EASY SEARCH

BlogsIndex = new EasySearch.Index({
  collection: Articles,
  fields: ['title', 'author','categories', 'blog'],
  engine: new EasySearch.MongoDB({
    sort: () => [["date","descending"],["title","ascending"]]
  })
});


// IRON ROUTER PAGE ROUTING

Router.configure({
  layoutTemplate:'main',
  loadingTemplate: 'loading'
});

// on startup if there are no users registered we use this page
Router.route('/startup', {
  name: 'startup',
  template: 'startup',
  onBeforeAction: function(){
    // check if there are users registered
    if (Meteor.users.find().count() === 0) {
      this.next();
    } else {
       Router.go('home');
    }
  }
});

Router.route('/', {
  name: 'home',
  template: 'home',
  onBeforeAction: function(){
    var rT = Session.get('resetToken');
    if (rT) {
      Router.go('reset');
    } else {
      this.next();
    }
  }
});
Router.route('/admin', {
  name: 'admin',
  template: 'admin',
  data: function(){
    return Meteor.user();
  },
  onBeforeAction: function(){
    if (Meteor.userId()){
      this.next();
    } else {
      Router.go('login');
    }
  }
});
Router.route('/editListing');
Router.route('/editListings');
Router.route('/findBlogs', {
  loadingTemplate: 'loading',
  waitOn: function(){
    return Meteor.subscribe('blogs');
  },
  action: function(){
    this.render('findBlogs');
  }
});
Router.route('/forgot');
Router.route('/forgotSent');

Router.route('/latest');
Router.route('/login');

// OPML
// creates fresh opml file when user presses button
Router.route('/opml', function(){
  var head = '<?xml version="1.0" encoding="ISO-8859-1"?>\n' +
  '<opml version="1.1">\n' +
  '<head>\n' +
  '<title>ausGLAMblogs feeds</title>\n' +
  '<dateCreated></dateCreated>\n' +
  '<dateModified></dateModified>\n' +
  '<ownerName>newCardigan</ownerName>\n' +
  '</head>\n' +
  '<body>\n' + 
  '<outline text="Australian GLAM Blogs">';

  var body = function(cat) {
    var blogList = Blogs.find({type: cat});
    var bArray = [];
    var totalBlogs = blogList.count();
    blogList.forEach(function(blog){
      let x = '<outline htmlUrl="' + blog.url + '" type="rss" xmlUrl="' + blog.feed + '" text="' + blog.url + '"/>';
      bArray.push(x);
    });
    var bString = bArray.toString();
    var markup = '\n' + bString.replace(/,/g,'\n');
    if (bArray.length === totalBlogs) {
      return markup
    }
  };

  var bodyArch = '<outline text="Archives">' + body('archives') + '</outline>\n';
  var bodyDH = '<outline text="Digital Humanities">' + body('DH') + '</outline>\n';
  var bodyGall = '<outline text="Galleries">' + body('galleries') + '</outline>\n';
  var bodyLibs = '<outline text="Libraries">' + body('libraries') + '</outline>\n';
  var bodyMus = '<outline text="Museums">' + body('museums') + '</outline>\n';
  var bodyGen = '<outline text="General GLAM">' + body('GLAM') + '</outline>\n';
  var bodyEnd = '</outline>\n' + '</body>\n' + '</opml>';
  var opmlFile = head + bodyArch + bodyDH + bodyGall + bodyLibs + bodyMus + bodyGen + bodyEnd;
  var headers = {
    'Content-Type': 'text/plain',
    'Content-Disposition': "attachment; filename=ausGLAMblogs.opml"
  };
  this.response.writeHead(200, headers);
  this.response.end(opmlFile);
  }, {where: 'server'});

Router.route('/pocket');
Router.route('/pocket-authentication');
Router.route('/register', {
  name: 'register',
  template: 'register',
  data: function(){
    return Meteor.user();
  },
  onBeforeAction: function(){
    if (Meteor.userId()){
      this.next();
    } else {
      Router.go('login');
    }
  }
});
Router.route('/registerBlog');
Router.route('/reset', {
  name: 'reset',
  template: 'reset',
  data: function(){
    return Meteor.user();
  },
  onBeforeAction: function(){
    var rT = Session.get('resetToken');
    // if there's no reset token, redirect to homepage
    if (!rT) {
      Router.go('/');
    } 
    // if they have a token, go to the verified page
    this.next();
  } 
});
Router.route('/searchBox', {
  loadingTemplate: 'loading',
  waitOn: function(){
    return Meteor.subscribe('articles');
  },
  action: function(){
    this.render('searchBox');
  }
});
Router.route('/success');
Router.route('/tagsList', {
  loadingTemplate: 'loading',
  waitOn: function(){
    return Meteor.subscribe('tags');
  },
  action: function(){
    if (this.ready()){
     this.render('tagsList');      
    }
  }
});
Router.route('/tagView');
