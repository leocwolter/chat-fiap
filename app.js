
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

io.enable("browser client minification");
io.enable("browser client etag");
io.enable("browser client gzip");

io.set("log level", 1);
io.set("transports", ["xhr-polling"]);
io.set("polling duration", 10);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


io.on("connection", function(client){
	client.on("new-message", function(message){
		client.broadcast.emit("new-message-recieved", message);
	});

	client.on("login", function(user, callback){
		if(user.password.length >= 8){
            client.set("currentUser", user);
			callback({
				"success" : true,
				"message" : "Logado como " + user.login
			});
			client.broadcast.emit("new-user", user);
		}else{
			callback({
				"success" : false,
				"message" : "Senha inválida"
			});
		}
	});

	client.on("disconnect", function(){
		client.get("currentUser", function(error, user){
			var logged = (user != undefined);
			console.log("deslogando " + user);
			console.log(error);
			if(logged){	
				client.broadcast.emit("logout", user);
			}
		});
	});
});

