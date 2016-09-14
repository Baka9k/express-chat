var postTemplate = '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-10"><div class="post"><div class="container-flud inline"><div class="name"><h4>{{name}}</h4></div><div class="date">{{date}}</div><div class="time">{{time}}</div></div><hr class="hr2"><div class="container-flud inline"><div class="text dont-break-out">{{{content}}}</div></div></div></div>';

var renderPost = Handlebars.compile(postTemplate);


//send message via AJAX

$("#nyaform").submit(function(e) {
	
	$.ajax({
		type: "POST",
		url: "/ajax/post",
		data: $("#nyaform").serialize(),
		success: function(data)
		{
			//callback
		},
	});

	e.preventDefault(); // avoid to execute the actual submit of the form.
	
	$("#nyaform textarea").val('');
});



var socket = new WebSocket('ws://127.0.0.1:3333');

socket.onopen = function () {
    //console.log('connected');
};


//receive new messages via WS

socket.onmessage = function (event) {
    var message = JSON.parse(event.data);
    //console.log(message);
    var renderedMessage = renderPost(message);
    $(renderedMessage).appendTo("#all-posts");
};



