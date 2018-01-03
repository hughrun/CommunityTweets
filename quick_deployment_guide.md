# Getting your app running in production

Before you deploy, you need make sure you have:

* checked the code for URLs, assets and wording that may need to be changed to match your app instead of Aus GLAM Blogs
* adjusted [the 'notGLAM' filter](https://www.hughrundle.net/2017/08/18/silencing-ausglamblogs/) to suit your community's needs.
* created a `public` directory with subdirectories `fonts` and `images` containing any font or image files you are using, and a favicon.ico file.
* set up DNS for your domain name to point to your production server
* set up your web server - nginx or Apache
* set up an HTTPS certificate for your domain using LetsEncrypt

Deploying Meteor apps is a bit finicky. The most complicated thing is setting up the Mongo database: unless you're a Mongo expert, the easiest and safest thing to do is use a Mongo hosting company like mLab, Scalegrid or nodechef. I use mLab(https://mlab.com/), which offers a free tier if you are just running a small app for fun. You will also need to register a few other things:

* an email service: **Mailgun** is free (unless you plan to have thousands of admins and blog registrations) and pretty easy to use
* A Twitter app: also free and fairly straightforward
* A Pocket developer API key: ditto

Links to all these can be found [on the README page](README.md)

## On local server
1. from inside dev folder (e.g. ~/Documents/CommunityTweets)

`meteor build where/you/are/saving --architecture os.linux.x86_64`

This builds a tarball for export, designed to run on linux 64 bit

2. from where you saved it
Use [scp](https://en.wikipedia.org/wiki/Secure_copy) to upload to your server:

`scp [name of tarball] user@remoteserver:~`

## on remote server

### to install and run directly

1. Make folder and move new files into it. **DO NOT USE SUDO** or you will mess up the permissions.

`mkdir myapp`
`mv my_awesome_app.tar.gz myapp`

2. Extract and install

`cd myapp`
`tar xf my_awesome_app.tar.gz`

3. Now you have a directory called ‘bundle’ - this is where *main.js* will be

`cd bundle/programs/server`
`npm install -y`

4. Now go back to where main.js is

`cd ../..`

5. Export settings

```
export PORT=3000
export ROOT_URL=“http://myurl.com”
export MONGO_URL=“mongo://user:pass@mongoblah”
export MAIL_URL=“smtp//mailinfoetc”
export METEOR_SETTINGS=‘{
"SITE_NAME":"My Awesome App",
"MAIL_URL":"smtp://postmaster@mg1.myurl.com:123abc@smtp.mailgun.org:587/",
"EMAIL_FROM":"hello@myurl.com",
"TWITTER_CONSUMER_KEY":"abcdefg",
"TWITTER_CONSUMER_SECRET":"abcdefg",
"TWITTER_ACCESS_TOKEN_KEY":"12345-abcdefg",
"TWITTER_ACCESS_TOKEN_SECRET":"abcdefg",
"POCKET_KEY":"12345-99abcedf"
}'
```

6. Run
`[sudo] node main.js`

### Using Docker

Using Docker with an externally hosted Mongo database makes your app very easy to maintain if you ever need to migrate to a new server etc.

1. Install [Docker](https://www.docker.com/) on your server
2. Edit the [example Dockerfile](Dockerfile_template) and save your edited version as `Dockerfile` in the same directory as your tarball on the server. You don't need to extract it, as the Dockerfile will do that. Then in the same directory, run:
3. `docker build . -t myawesomeapp`
4. `docker run -d -p 3000:443 myawesomeapp`

### Using Upstart
1. Make a file like this:

`sudo nano /etc/init/myawesomeapp.conf`

```
# upstart for My Awesome App
description "Meteor.js application"
author "Jane Citizen"

# When to start
start on runlevel [2345]

# When to stop
stop on shutdown

# Restart on crash
respawn
respawn limit 10 5

script
  export PORT=3000
  export ROOT_URL=“http://myurl.com”
  export MONGO_URL=“mongo://user:pass@mongoblah”
  export MAIL_URL=“smtp//mailinfoetc”
  export METEOR_SETTINGS=‘{
  "SITE_NAME":"My Awesome App",
  "MAIL_URL":"smtp://postmaster@mg1.myurl.com:123abc@smtp.mailgun.org:587/",
  "EMAIL_FROM":"hello@myurl.com",
  "TWITTER_CONSUMER_KEY":"abcdefg",
  "TWITTER_CONSUMER_SECRET":"abcdefg",
  "TWITTER_ACCESS_TOKEN_KEY":"12345-abcdefg",
  "TWITTER_ACCESS_TOKEN_SECRET":"abcdefg",
  "POCKET_KEY":"12345-99abcedf"
  }'
  node /home/user/my_awesome_app/bundle/main.j >> /home/user/my_awesome_app/myawesomeapp.log
end script
```

2. Run your app: `[sudo] service myawesome app start`

# Setting up your app

Once you've deployed your app, you need to do a couple of things to get it set up properly.

1. Go to https://yourappurl.com/startup
2. You should see a screen telling you to register an account. The email address you register here will become the Owner of your application. Once you've registered an account on this page the /startup route will redirect to the home page.
3. enter an email address, then click on the link in the email you get to complete registration and log in.

That's it :-)

All admins will get an email whenever someone registers a blog. You then need to log in to the app to approve each blog: this prevents spammers from registering dodgy sites on your app and having them tweeted out.