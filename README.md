
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


# CommunityTweets
Formerly known as meteor2twitter at GitLab. This code runs [AusGLAMBlogs](https://glamblogs.newcardigan.org)

v 0.5.0

## Overview

This is a Meteor app that allows users to add a blog feed listing via a web interface, stores them in a Mongo database, and tweets when a new feed is added or a new post is published.

It loops every 10 minutes, and only announces one new feed each cycle, to avoid triggering Twitter’s spam blockers. Each post is tweeted three times. six hours apart.

Bloggers can register their blog, and then one or more administrators approve the new listing - everything in the RSS feed (usually the last 10 or 20 posts) is then added to the app's index, and new posts will be added and tweeted.

Your community can find the latest posts either by following your twitter bot or checking/searching the web app.

## New in v 0.5.0

* added ability for bloggers to avoid including a particular post by giving it a specified filter tag
* minor updates to web app text
* **as of this version CommunityTweets is now licensed under GPL v3** - see LICENSE for full terms

## New in v 0.4.5
* Pocket integration

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
* MongoDB hosting account (optional but recommended)
* A Twitter account with [app keys](https://apps.twitter.com)
* A [Mailgun](https://www.mailgun.com) account
* A [Pocket API key](https://getpocket.com/developer/)

## Dependencies

### Meteor (Atmosphere)

* http
* iron:router
* themeteorchef:jquery-validation
* accounts-password
* email
* easy:search
* session

### npm

* feedparser-promised
* twit

Note that `feedparser-promised` and `twit` are now installed direct from npm using `Meteor npm install --save [packagename]`.

Don't forget to add a /public/fonts and /public/images directory for your images and fonts (not included here for copyright reasons).

## Demo

At [@ausGLAMBlogs](https://twitter.com/ausglamblogs) and [glamblogs.newcardigan.org](https://glamblogs.newcardigan.org)

## Deploying

To deploy your own version, see the [Quick Deployment Guide](quick_deployment_guide.md)

## TODOs

* auto-check feed works before approval
* admins can manually remove a post from the index and tweet queue

## LICENCE

GPL 3+
