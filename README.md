# CommunityTweets
Formerly known as meteor2twitter at GitLab.

v 0.3.0

## Overview

This is a Meteor app that allows users to add a blog feed listing via a web interface, stores them in a Mongo database, and tweets when a new feed is added or a new post is published.

It loops every 10 minutes, and only announces one new feed each cycle, to avoid triggering Twitter’s spam blockers.

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

## Requirements

* [nodejs](https://nodejs.org)
* [Meteor](https://www.meteor.com)
* A Twitter account with [app keys](https://apps.twitter.com)
* A [Mailgun](https://www.mailgun.com) account

## Dependencies

See **packages**

Don't forget to add a /public/fonts and /public/images directory for your images and fonts (not included here for copyright reasons).

## Demo

At [@ausGLAMBlogs](https://twitter.com/ausglamblogs) and [glamblogs.newcardigan.org](https://glamblogs.newcardigan.org)

## TODOs

* change front page design so it's a grid of 6 - three big circles and then the existing three icons
* fix CSS for better mobile/responsive
* mark on listing whether good feed or failing
* check feed works before approval
* process to add all previous articles and tags on approval
* refactor for Meteor 1.3 NPM integration
