# Getting started (Ubuntu)

```bash
$ sudo apt-get update
$ sudo apt-get -y install git
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash
$ source ~/.bashrc
$ nvm install 0.12
```

# Installing MongoDB
```bash
$ sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
$ echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | $ sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
$ sudo apt-get update
$ sudo apt-get install -y mongodb-org
$ sudo service mongod start
```

```bash
$ git clone https://github.com/GATAKAWAKACHICO/quiz-nodejs
$ nvm use 0.12
$ npm config set registry http://registry.npmjs.org/
$ npm install --save socket.io
$ npm install --save express@4.10.2
$ npm install --save mongoose
$ npm install -g forever
$ cd quiz-nodejs
```

# Daemonize
```bash
$ forever start index.js
```

# This app is forked from chat-example

This is the source code for a very simple chat example used for 
the [Getting Started](http://socket.io/get-started/chat/) guide 
of the Socket.IO website.

Please refer to it to learn how to run this application.
