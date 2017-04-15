# CommunityTweets
Formerly known as meteor2twitter at GitLab.

v 0.5

## Overview

This is a Meteor app that allows users to add a blog feed listing via a web interface, stores them in a Mongo database, and tweets when a new feed is added or a new post is published.

It loops every 10 minutes, and only announces one new feed each cycle, to avoid triggering Twitter’s spam blockers. Each post is tweeted three times. six hours apart.


### Set Up

You need to be running [Meteor](https://www.meteor.com) including all **requirements** and **dependencies** (listed below).

On first use, go to **[url]/startup** to set admin user.

Prior to putting in production, ensure you change `pocketRedirectUrl` from `localhost:3000` to your own base URL in both server.js and client.js, as well as other necessary edits to wording of pages etc (code here comes with all the original `ausGLAMBlogs` wording, which should be changed for obvious reasons).

In addition to environment settings for `PORT`, `ROOT_URL`, `MONGO_URL` and `MAIL_URL` (see Mailgun documentation) you'll need to use `METEOR_SETTINGS` for:

* SITE_NAME ('My Awesome Website')
* EMAIL_FROM (email address you want your email messages to appear to come from)
* TWITTER credentials (see Twitter documentation)
* POCKET_KEY (Pocket platform consumer key)

## New in v 0.5
* added ability for admins to edit blog listings
* added [Pocket](https://getpocket.com/) integration

## New in v 0.4.1
* fixed problem with text fields on small screens
* amended code for picking up failing feeds

## New in v 0.4

### bug fixes
* fixed problem where posts weren't initially tweeted if the 'published date' was earlier than the date they were actually published (mostly scheduled posts)
* fixed problem with tags not being added to tags collection
* admins no longer have to log in again if they navigate away from admin area
* routing now goes to top of page when clicking on nav links
* some admin pages showed errors - now they don't
* searchbox now always get focus when navigating to search page
* password length validation now occurs on password creation instead of login

### new features
* upgraded for Meteor 1.4.2.3
* now uses `feedparser-promised` and `twit`
* 'uncategorized' is now excluded from tags list
* better responsiveness with two breakpoints and now responsive for admin area
* when adding a blog, old posts are now added to the archive and recent posts tweeted
* previously unseen posts are now added regardless of publication date
* posts are queued for tweeting if they have a publication date within the last 48 hours, and always tweeted 3 times

## New in v 0.3.0
* Now archives new posts and their tags each cycle
* Shows running total of blogs, posts and tags on home screen
* Shows latest 10 posts on initial 'browse/search' screen
* Browse by tag
* Search with EasySearch - indexes blog URL and post title, author and tags/categories
* Cleaned up code to make it a bit easier to read

## New in v 0.2.2
* fixed major bug in approving pending listings
* discovered why unit testing is a good idea

## New in v 0.2.1
* fix to allow listing removal for existing collection
* cleaned up leftover testing code

## New in v 0.2.0
* cleaner admin interface
* admins can now reject an update to a listing without deleting the original
* admins can now delete a listing
* admins are emailed when an admin is added, deleted, or changed to owner
* blog listing refers to 'Address' not 'Feed'
* fixed bug with registering museums-related blogs
* address and twitter account in listings are now links
* ability to download OPML file
* failing feeds are identified on blog browse page

## Requirements

* [nodejs](https://nodejs.org)
* [Meteor](https://www.meteor.com)
* A Twitter account with [app keys](https://apps.twitter.com)
* A [Mailgun](https://www.mailgun.com) account
* A [Pocket Platform Consumer Key](https://getpocket.com/developer/docs/authentication)

## Dependencies

### Meteor (Atmosphere)

* http
* iron:router
* themeteorchef:jquery-validation
* accounts-password
* email
* easy:search
* session

(see `packages` for full list)

### npm

* feedparser-promised
* twit

Note that `feedparser-promised` and `twit` are now installed direct from npm using `Meteor npm install --save [packagename]`.

Don't forget to add a /public/fonts and /public/images directory for your images and fonts (not included here for copyright reasons).

## Demo

At [@ausGLAMBlogs](https://twitter.com/ausglamblogs) and [glamblogs.newcardigan.org](https://glamblogs.newcardigan.org)

## TODOs

* check feed works before approval
* refactor codebase to ES6
