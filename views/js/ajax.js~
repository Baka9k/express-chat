var messages = [];

var getMessages = function(callback) {

	$.get('/ajax/getall', function (data) {
		//console.log(data);
		callback(data);
	});
	
};

var postsTpl = '<div class="container js-all-posts">{{#each posts}}<div class="col-xs-12 col-sm-12 col-md-12 col-lg-10"><div class="post"><div class="container-flud inline"><div class="name"><h4>{{name}}</h4></div><div class="date">{{date}}</div><div class="time">{{time}}</div></div><hr class="hr2"><div class="container-flud inline"><div class="text dont-break-out">{{{content}}}</div></div></div></div>{{/each}}</div>';

var postTpl = '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-10"><div class="post"><div class="container-flud inline"><div class="name"><h4>{{name}}</h4></div><div class="date">{{date}}</div><div class="time">{{time}}</div></div><hr class="hr2"><div class="container-flud inline"><div class="text dont-break-out">{{{content}}}</div></div></div></div>';

var renderPosts = Handlebars.compile(postsTpl);

var renderPost = Handlebars.compile(postTpl);

$("#nyaform").submit(function(e) {
	
	$.ajax({
		type: "POST",
		url: "/ajax/post",
		data: $("#nyaform").serialize(),
		success: function(data)
		{
			//getMessages(drawNewMessages);
			//console.log('RECV:',data);
			//drawNewMessages(data);
		},
	});

	e.preventDefault(); // avoid to execute the actual submit of the form.
	
	$("#nyaform textarea").val('');
});


var drawNewMessage = function(message) {
	$('.js-all-posts').append(renderPost(message));
}

var drawNewMessages = function(messages) {
	$('.js-all-posts').replaceWith(renderPosts({posts: messages}));
	/*
	for (var i = 0; i < messages.length; i++) {
		var message = messages[i];
		$("<p>" + message.content + "</p>").appendTo("body");
	}
	*/
};

//Receive messages via polling
/*
setInterval( function() {
    getMessages(function (data) {
        if (JSON.stringify(messages) !== JSON.stringify(data)) {
            drawNewMessages(data);
        }
    });
}, 1000);
*/

// Receive messages via a standard WebSocket
/*
var socket = new WebSocket("ws://127.0.0.1:3333/push");

socket.onmessage = function(event) {
  var data = JSON.parse(event.data);
  console.log("RECV:", data);
  drawNewMessage(data);
};
*/

// Receive messages via Socket.IO
var socket = io('http://localhost:3000');

socket.on('msg', function(data) {
    console.log("RECV:", data);
    drawNewMessage(JSON.parse(data));
});

