define([], function (Thread) {
	var view, board;
	var obj = {};
	function updateLinks(node, color, claiming){
		color = color || "#000000";
		node.color = color;
		var nodelinks = view.graph.nodes(node.links);
		var nodeedges = view.graph.edges(node.edges);
		for(var i = 0; i < nodelinks.length; i++){
			if(claiming){
				nodelinks[i].hidden = false;
				nodeedges[i].hidden = false;
			}
			if(nodelinks[i].color === color){
				nodeedges[i].color = color;
			}else if(nodelinks[i].color !== "#000000"){
				nodeedges[i].color = "#000000";
			}
		}
		view.refresh();
		return node;
	}


	function Interface (game) {
		var color = game.board[game.role];
		this.playerColor = color;
		this.opponent = game.opponent;
		board = game.board;
		view = new sigma({
					graph: game.board,
					renderers: [{
						container: document.getElementById("container"),
						type: "canvas"
					}]
				});
		this.thread = new Thread(30, view.graph);
		var clickANode = function (func, event) { func(event.data.node); };

		var hey = function (func, event) { 
			var crawl = function(node) {
				var crawled = [];
				var queue = [];
				var crawlLayer = function(claimedNode) {
					queue = claimedNode.links.concat(queue);
				};
				crawlLayer(func(node));
				var timeout = setInterval(function() {
					if (queue.length === 0) window.clearInterval(timeout);
					var n = queue.shift();
					if (crawled.indexOf(n) === -1) {
						crawlLayer(func(view.graph.nodes(n)));
						crawled.push(n);
					}
				}, 2);
			};
			var color  = event.data.node.color;
			crawl(event.data.node);
		};

		hey = hey.bind(this, this.claim.bind(this));
		clickANode = clickANode.bind(this, this.claim.bind(this));
		view.bind("clickNode", hey);

		var baseId = game.role === "host" ? game.board.bases.host.id : game.board.bases.client.id;
		var base = view.graph.nodes(baseId);
			base.hidden = false;
			updateLinks(base, color, true);
	}

	Interface.prototype.addOpponent = function (opponent) {
		this.opponent = opponent;
	}

	Interface.prototype.claim = function (node) {
		var returnedNode = updateLinks(node, this.playerColor, true);
		this.opponent.send({type: "claim", data: node.id, color: this.playerColor});
		return returnedNode;
	}

	Interface.prototype.updateBoard = function (nodeid, color) {
		var node = view.graph.nodes(nodeid);
		updateLinks(node, color, false);
	}


	return Interface;
});