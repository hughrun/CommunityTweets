// ######################################################################################
// ################# This section runs the Twitter bot ##################################
// ######################################################################################

// npm imports
import feedparser from 'feedparser-promised';
import Twit from 'twit';


// Set up the twitter app credentials

const T = new Twit({
    consumer_key:         Meteor.settings.TWITTER_CONSUMER_KEY
  , consumer_secret:      Meteor.settings.TWITTER_CONSUMER_SECRET
  , access_token:         Meteor.settings.TWITTER_ACCESS_TOKEN_KEY
  , access_token_secret:  Meteor.settings.TWITTER_ACCESS_TOKEN_SECRET
});

// ***************************************************************************************************
//
// 											** METHODS **
//
// ***************************************************************************************************

const Announcement = {
		// trim the article title if it's too long to fit in the tweet
  title: title => {
    const itemTitle = (title.length > 70) ? title.substring(0, 70) + "..." : title;
    return itemTitle;
  },
  // create the status for tweeting articles
  status: (title, name, link, punct) => {
   return {"status" : Announcement.title(title) + ` ${punct} ${name} ${punct} ${link}`, "link" : link};
  },
  // add article to Articles collection
  prep: (item) => {
  	// normalise tag names
	var array = item.categories;
	var categories = [];
	array.forEach( x => {
	  var normalised = x.toLowerCase();
	  categories.push(normalised);              
	});
	// Upsert tags into the Tags collection
  	categories.forEach( tag => {
    	Tags.upsert({tag: tag}, {$inc:{total: 1}});
   });
	  // Upsert the post into the Articles collection
	return Articles.upsert({link: item.link}, {$set: {title: item.title, author: item.author, categories: categories, blog: item.meta.title, blogLink: item.meta.link, date: item.pubdate}}, 
		(err, data) => {
			if (err) {console.log(`error upserting article  --> ${err}`)};
		});
  },
  // queue tweet status in Tweets collection with appropriate punctuation
  queue: (title, name, link, punct) => {
	return Tweets.insert(Announcement.status(title, name, link, punct), (err) => {
		if (err) {console.error(`error queueing tweet --> ${err}`)};
	});
  },
  // function to post article to Twitter
  post: (status, link, id) => {
  	// tweet new blog post

	T.post('statuses/update',
	   {'status' : status},
	   // deal with any twitter errors
	   (error, data, response) => {
	   	if (error){	
	     console.error("Twit error with " + status + " --> " + error);
	   	};
	});

		 // remove queued tweet after it's posted	 
			Tweets.remove({"_id" : id});		
			// Upsert tweet info into Articles collection
			// Doing it like this means that if the app goes down or otherwise fails it will still... 
			// ...tweet every post 3 times, at least 6hrs apart.
		 	// Set a new tweeted date
			var now = new Date();
		 Articles.upsert({link: link}, {$set: {"tweeted.date": now}});
		 // Increment the 'posted' field
		 return Articles.upsert({link: link}, {$inc: {"tweeted.times": 1}});
		 },
};

// ***************************************************************************************************
// ***************************************************************************************************
//
// 										** RUNBOT LOOP **
//
// ***************************************************************************************************
// ***************************************************************************************************

// Set timeout to loop the whole thing every 10 minutes (600000ms)

const timerVar = Meteor.setInterval (runBot, 600000);

console.log('running...');

// When 10 minutes has elapsed, run the bot!
function runBot() {
// ***************************************************************************************************	
// 										** CHECK LISTINGS **		
// check for any new listings to announce if there are any, announce the first one only
// this stops us from blasting out a whole bunch at once and triggering the Twitter Police
// ***************************************************************************************************

	const fresh = Blogs.find({announced: false});
	if (fresh.count() > 0) {
	  	var b = Blogs.findOne({announced: false});
		var id = b._id;
		var url = b.url;
		var name = b.twHandle ? b.twHandle : b.author;
	  	// announce new blog listing
	  	T.post('statuses/update',
	    {'status' : `${url} by ${name} has been added to my feed. Nom nom!`},
	    // deal with any twitter errors
	    (error, data, response) => {
	    	if (error) {
	      		console.error("Twit error for added feed: " + error);
	    	}
	    });
	  	// mark the blog as 'announced'             
		Blogs.update({_id: id}, {$set:{announced: true}}, (err, data) => {
			if (err) {
				console.error("error setting blog to announced: " + err)
			} else {
				console.log("updated " + data);
			}
		});
	};
// ***************************************************************************************************
// 			** PROCESS NEW POSTS **
// ***************************************************************************************************

	// get everything from the Blogs collection
	const bList = Blogs.find();
	bList.forEach( blog => {
		// exclude blogs that haven't been approved yet
		if (blog.approved !== false) {
			// parse out the posts in each blog feed
			feedparser.parse(blog.feed).then( (items) => {
				// if the feed previously failed, change 'failed' to false
				// (if it continues to fail it will be update in the catch below)
				if (blog.failing) {
					Blogs.update({feed: blog.feed}, {$set: {failing: false}}, (err, data) => {
						if (err) {console.err(`error ${err}`)
						} else {
							console.log(`${data} documents updated`);
						}
					});
				}				
				items.forEach( (item) => {
					// if there's a Twitter handle listed in Articles use that as 'name', 
					// otherwise use the author name from the post
					var name = blog.twHandle ? blog.twHandle : item.author;
					// get times
					var now = new Date();
					var cutoff = new Date(now - 1.728e+8);
					var pubdate = new Date(item.pubdate);			

					// *********************************
					// 		** NEW POSTS **
					// *********************************
					
					// if it's not already in the Articles collection, upsert data to Articles and Tags
					var recorded = Articles.findOne({link: item.link});
					if (!recorded){
					   	// upsert to collections
					   	Announcement.prep(item);		
						// if publication date is within the last 48 hours, queue a tweet
						// not this also applies to recent articles from newly added feeds
						if (pubdate > cutoff) {
					   		var punct = "-";
					   		Announcement.queue(item.title, name, item.link, punct);
					   	}
					// if it IS already in the Articles collection check how many times it's been tweeted  	
					} else {
						
						// *********************************
						// 		** NEWISH POSTS **
						//
						//	i.e. ones we first saw recently 
						//	that need to be tweeted again.
						// *********************************
						
						//trigger additional tweets at 6, and 12 hours (we already tweeted at 0 hours above)
						// if there's no 'tweeted' field we simply ignore it
						if (recorded.tweeted && (recorded.tweeted.times < 3)) {
							// if the tweeted.date exists and is older than 6 hours ago choose punctuation style
							// this is a failsafe to stop Twitter blocking 'duplicate' tweets
							// note for the initial tweet punct is set as '-' (see New Posts above)					
							if (recorded.tweeted.date < (now - 2.16e+7)) {
								var punct = (recorded.tweeted.times === 1) ? "|" : "/";
								// queue tweet
								Announcement.queue(item.title, name, item.link, punct);
							}
						}
					}
				});
			}).catch( (error) => {
				console.error(`error with ${blog.feed} --> ${error}`);
				if (error === "Error: Not a feed") {
					Blogs.update({feed: blog.feed}, {$set: {failing: true}}, (err, data) => {
						if (err) {console.err(`error ${err}`)
						} else {
							console.log(`${data} documents updated`);
						}
					});
				}
			});
		}	
	});  

	// ***************************************************************************************************
	//								** CHECK QUEUED TWEETS **
	//																																				
	// as with the new blog listings, this is restricted to one every loop (i.e. every ten minutes)
	// ***************************************************************************************************

	// Get the next tweet in the queue
	var nextTweet = Tweets.findOne({});
	// send off to be tweeted
	if (nextTweet) {
		Announcement.post(nextTweet.status, nextTweet.link, nextTweet._id);
	};

	// log when the loop is completed so you know the process has run.
	var dateCompleted = new Date();
	console.log('loop completed at ' + dateCompleted);
};
// ######################################################################################
// ######################## End of Twitter bot section ##################################
// ######################################################################################