var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var redis = require('redis').createClient();
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var QuestionAnswersSchema = new Schema({
  name: String,
  answer: String,
  time: Number
});
var ScoreSchema = new Schema({
  name: String,
  score: { type: Number, default: 0 },
  gameover: { type: Boolean, default: false }
});
mongoose.model('QuestionAnswers', QuestionAnswersSchema);
mongoose.model('Score', ScoreSchema);
var QuestionAnswers = mongoose.model('QuestionAnswers');
var Score = mongoose.model('Score');
mongoose.connect('mongodb://localhost/allstardb');

/* app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
}); */

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    io.emit('chat message', {"admin":true, "type":"data-connection-count", "content": socket.client.conn.server.clientsCount});
    if(msg.admin == false) {
      if(msg.type == "answered"){
        var score = new Score();
        Score.findOne({ 'name': msg.name }, 'name score', function (err, found) {
          if(!found){
            score.name = msg.name;
            score.score = 0;
            score.save(function(err) {
              if (err) { console.log(err); }
            });
          }
        });
        var answer = new QuestionAnswers();
        answer.name = msg.name;
        answer.answer = msg.answer;
        answer.time = msg.time;
        answer.save(function(err) {
          if (err) { console.log(err); }
        });
      }
    }
    if(msg.admin == true) {
      if(msg.type == "quiz") {
        gameover_user = [];
        Score.find({"gameover":true}, function(err, docs) {
          for(i = 0; i < docs.length; i++){
            gameover_user.push(docs[i].name);
          }
        data = {"admin":true, "type":"data-gameover-user", "content": gameover_user };
        io.emit('chat message', data);
        });
      }
      if(msg.type == "question-answer") {
        QuestionAnswers.find({}, function(err, docs) {
          console.log(docs);
          data = {"admin":true, "type":"data-answer-sum", "content": docs};
          io.emit('chat message', data);
        });
      }
      if(msg.type == "answer"){
        gameover_user = [];
        QuestionAnswers.find({}, function(err, docs) { 
          console.log(docs);
          for(i = 0; i < docs.length; i++){
            if(docs[i].answer == msg.content){
              // 正解者
              name = docs[i].name;
              Score.findOne({ 'name': docs[i].name }, 'name score', function (err, found) {
                if (err) return handleError(err);
                new_score = found.score + 1;
                console.log("new_score");
                console.log(new_score);
                found.score = new_score;
                found.save();
                // Score.findOneAndUpdate({name: name}, { score: new_score }, {upsert: true}, function(err) {console.log(err);});
              });
            }else{
              // 不正解者
              Score.findOne({ 'name': docs[i].name }, 'name score', function (err, found) {
                if (err) return handleError(err);
                found.gameover = true;
                found.save();
              });
              gameover_user.push(docs[i].name);
            }
          }
          data = {"admin":true, "type":"data-gameover-user", "content": gameover_user };
          io.emit('chat message', data);
          /*QuestionAnswers.remove({}, function(err) { 
             console.log('collection removed'); 
          });*/
        });
      }
      if(msg.type == "worst10") {
        // QuestionAnswers.find({},{},{sort:{"time": -1},limit:10}, function(err, docs) {
        QuestionAnswers.find({"answer":msg.answer}, {}, {sort:{"time": 1}}, function(err, docs) {
          data = {"admin":true, "type":"data-worst10", "content": docs}
          io.emit('chat message', data);
        });
      }
      if(msg.type == "worst") {
        console.log("worst");
        Score.findOne({ 'name': msg.name }, 'name score', function (err, found) {
          if (err) return handleError(err);
          /* new_score = found.score - 1;
          found.score = new_score; */
          found.gameover = true;
          found.save();
        });
      }
      if(msg.type == "best10") {
        QuestionAnswers.find({"answer":msg.answer}, {}, {sort:{"time": 1}, limit:10}, function(err, docs) {
          data = {"admin":true, "type":"data-best10", "content": docs}
          io.emit('chat message', data);
        });
      }
      if(msg.type == "point-ranking"){
        Score.find({}, {}, {sort:{"score": -1},limit:10}, function(err, docs) {
          console.log(docs);
          data = {"admin":true, "type":"data-point-ranking", "content": docs};
          io.emit('chat message', data);
        });
      }
      if(msg.type == "round-reset"){
        Score.update({}, {$set: {"gameover":false}}, { multi: true }, function(err, docs){
          // ゲームオーバーの人を復活
        });
        console.log("round reset");
      }
      if(msg.type == "remove-all"){
        Score.remove({}, function(err) { 
          console.log('score removed'); 
        });
        QuestionAnswers.remove({}, function(err) { 
          console.log('question answers removed'); 
        });
      }
      if(msg.type == "start"){
        QuestionAnswers.remove({}, function(err) { 
          console.log('question answers removed'); 
        });
      }
    }
  });
});

http.listen(4649, function(){
  console.log('listening on *:4649');
});
