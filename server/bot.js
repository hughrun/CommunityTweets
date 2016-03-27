// ######################################################################################
// ################# This section runs the Twitter bot ##################################
// ######################################################################################

// Set up the twitter app credentials

var twitter = new TwitMaker({
    consumer_key:         Meteor.settings.TWITTER_CONSUMER_KEY
  , consumer_secret:      Meteor.settings.TWITTER_CONSUMER_SECRET
  , access_token:         Meteor.settings.TWITTER_ACCESS_TOKEN_KEY
  , access_token_secret:  Meteor.settings.TWITTER_ACCESS_TOKEN_SECRET
});

// Set timeout to loop the whole thing every 10 minutes
// Here we have to use Meteor.setInterval to replace setInterval from the original bot
var run = function() {
            runBot()
          };
var timerVar = Meteor.setInterval (run, 600000);

// When 10 minutes has elapsed, run the bot!
console.log('running...');
function runBot() {

// +++++++++++++++++++++++++++++++++++++++
  // check for any new listings to announce
  // if there are any, announce the first one only
  // this stops us from blasting out a whole bunch at once
  // and triggering the Twitter Police
  var fresh = Blogs.find({announced: false});
  if (fresh.count() > 0) {
    var b = Blogs.findOne({announced: false});
    var id = b._id;
    var url = b.url;
    var twHandle = b.twHandle;
    var author = b.author;
    // tweet
    if (twHandle) {
      twitter.post('statuses/update',
        {'status' : url + ' by ' + twHandle + ' has been added to my feed. Nom nom!'},
        // deal with any twitter errors
        function(error, data) {
          console.dir(error);
        });
    } else {
      twitter.post('statuses/update',
        {'status' : url + ' by ' + author + ' has been added to my feed. Nom nom!'},
        // deal with any twitter errors
        function(error, data) {
          console.dir(error);
        });              
    }
  Blogs.update({_id: id}, {$set:{announced: true}});
}

// +++++++++++++++++++++++++++++++++++++++

  // iterate over the list of blogs

  var bList = Blogs.find();
  bList.forEach(function(blog) {

// exclude anything that hasn't been approved yet
if (blog.approved !== false) {

    var feed = blog.feed;
    var twHandle = blog.twHandle;
  
    // set up Feedparser
    // we use Request and FeedParser
    var req = Request(feed);
    var feedparser = new FeedParser();

    // deal with any errors in FeedParser
    req.on('error', function (error) {
      console.error('feedparser error: ' + error); 
    });

    req.on('response', function (res) {
      var stream = this;
      // deal with any errors in the feed
      if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
      stream.pipe(feedparser);
    });

    // deal with any errors in the code
    feedparser.on('error', function(error) {
      console.error('feedparser code error: ' + error); 
    });

    feedparser.on('readable', function() {
      // This is where the action is! 
      var stream = this
          , meta = this.meta
          , item;
        while (item = stream.read()) {
        
        // Get the date and time right now
        var dateNow = new Date();
        // Get the date 11 minutes ago (roughly the last time the bot finished running)
        // Twitter should reject any duplicate posts that slip through if the code runs faster
        var lastRun = dateNow - 660000;
        // Get the date 12 hours ago
        var dateYesterday = dateNow - 43200000;
        // Get the date 12 hours and ten minutes ago
        var dateYPT = dateNow - 43800000;
        // Ensure we only try to post things published between 12 hours and 12 hours 10 minutes ago
        if (item.date > dateYPT && item.date < dateYesterday){

          // Here we are ensuring that long post titles don't lose the link in the tweet.
          var titleLength = item.title.length;
          var itemTitle = item.title;
          // if the title is shorter than 70 characters, post it to twitter as is.
          if (titleLength < 70) {
            if (twHandle) {
              twitter.post('statuses/update',
                {'status' : item.title + ' | ' + twHandle + ' | ' + item.link},
                // deal with any twitter errors
                function(error, data) {
                  console.dir(error);
                }     
            );
            } else {
              twitter.post('statuses/update',
                {'status' : item.title + ' | ' + item.author + ' | ' + item.link},
                // deal with any twitter errors
                function(error, data) {
                  console.dir(error);
                }     
              );              
            }
          }
          // If the title is longer than 70 characters we truncate it.
          else {
            trimmedTitle = itemTitle.substring(0, 70);
            if (twHandle) {
              twitter.post('statuses/update',
                {'status' : trimmedTitle + ' | ' + twHandle + ' | ' + item.link},
                // deal with any twitter errors
                function(error, data) {
                  console.dir(error);
                });
            } else {
              twitter.post('statuses/update',
                {'status' : trimmedTitle + ' | ' + item.author + ' | ' + item.link},
                // deal with any twitter errors
                function(error, data) {
                  console.dir(error);
                });              
            }
          }
        }
        // if the publication date was 11 minutes ago or less (i.e. since we last ran the bot)
        if (item.date > lastRun){

          // Here we are ensuring that long post titles don't lose the link in the tweet.
          var titleLength = item.title.length;
          var itemTitle = item.title;
          // if the title is shorter than 70 characters, post it to twitter as is.
          // we also change the separators so Twitter doesn't reject it as a duplicate post
          if (titleLength < 70) {
            if (twHandle) {
              twitter.post('statuses/update',
                {'status' : item.title + ' | ' + twHandle + ' | ' + item.link},
                // deal with any twitter errors
                function(error, data) {
                  console.dir(error);
                });
            } else {
              twitter.post('statuses/update',
                {'status' : item.title + ' | ' + item.author + ' | ' + item.link},
                // deal with any twitter errors
                function(error, data) {
                  console.dir(error);
                }     
              );              
            }           
          }
          // If the title is longer than 70 characters we truncate it.
          // we also change the separators so Twitter doesn't reject it as a duplicate post
          else {
            trimmedTitle = itemTitle.substring(0, 70);
            if (twHandle) {
              twitter.post('statuses/update',
                {'status' : trimmedTitle + ' | ' + twHandle + ' | ' + item.link},
                // deal with any twitter errors
                function(error, data) {
                  console.dir(error);
                }     
            );
            } else {
              twitter.post('statuses/update',
                {'status' : trimmedTitle + ' | ' + item.author + ' | ' + item.link},
                // deal with any twitter errors
                function(error, data) {
                  console.dir(error);
                });              
            } 
          } 
        } 
      }
    });
  }
});

// log when the loop is completed so you know the process has run.
var dateCompleted = new Date();
console.log('loop completed at ' + dateCompleted);
};
// ######################################################################################
// ######################## End of Twitter bot section ##################################
// ######################################################################################