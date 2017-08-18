# deploying Meteor

## from inside dev folder (e.g. ~/Downloads/CommunityTweets)

`meteor build where/you/are/saving --architecture os.linux.x86_64`

This builds a tarball for export, designed to run on linux 64 bit

## from where you saved it

`scp [name of tarball] user@remoteserver:~`

## on remote server

Make folder and move new files into it. DO NOT USE SUDO.

`mkdir myapp`
`mv my_awesome_app.tar.gz myapp`

To extract and install

`cd myapp`
`tar xf my_awesome_app.tar.gz`

Now you have a directory called ‘bundle’ - this is where *main.js* will be

`cd bundle/programs/server`
`npm install -y`

Now go back to where main.js is

`cd ../..`

Export settings

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

Now test running it
`[sudo] node main.js`

If all good, make an Upstart file
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

Run your app: `[sudo] service myawesome app start`

You should now be up and running at [your IP]:3000