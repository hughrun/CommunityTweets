# deploying Meteor

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