# CommunityTweets
Formerly known as meteor2twitter at GitLab.

v 0.2.1

## Overview

This is a Meteor app that allows users to add a blog feed listing via a web interface, stores them in a Mongo database, and tweets when a new feed is added or a new post is published.

It loops every 10 minutes, and only announces one new feed each cycle, to avoid triggering Twitter’s spam blockers.

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

Don't forget to add a /public/fonts and /public/images directory for your images and fonts (no included here for copyright reasons).

## Demo

At [@ausGLAMBlogs](https://twitter.com/ausglamblogs) and [glamblogs.newcardigan.org](https://glamblogs.newcardigan.org)

