
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);

var io = require("socket.io").listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


io.on("connection", function(client){
	client.on("new-message", function(message){
		client.broadcast.emit("new-message-recieved", message);
	});

	client.on("login", function(user, callback){
		if(user.password.length >= 8){
			console.log("logado");
			callback({
				"success" : true,
				"message" : "Logado como " + user.login
			});
		}else{
			callback({
				"success" : false,
				"message" : "Senha inválida"
			});
		}
	});
});
