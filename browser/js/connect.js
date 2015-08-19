define(["lib/peer", "js/game.components/board", "js/game.logic/interface", "lib/httpUtil"], function (Peer, Board, Interface, httpGet) {


	//Utility object to hold the client's Id, peer reference, and current connection reference
	var game = {myId: undefined, player: undefined, opponent: undefined, board: undefined};
	var gameInterface;

	function PeerConnect () {
		httpGet("/env", connectToServer);

		//When a peer DataConnection is established
		function peerDataCommunication(peerconn) {
			game.opponent = peerconn;

			//When the connection opens...
			peerconn.on("open", function () {
				if(game.role === "host") {
					peerconn.send({type: "board", data: game.board});
					gameInterface.addOpponent(peerconn);
				}
				//Listen for data
				peerconn.on('data', function (data) {
					//Do stuff with incoming data
					if(data.type === "board"){
						game.board = data.data;
						gameInterface = new Interface(game);
					}else if (data.type === "claim"){
						gameInterface.updateBoard(data.data, data.color, data.source);
					}
				});
			});

			//If the other user closes the connection, search for another user
			peerconn.on("close", function () {
				console.log("closing connection");
				peerconn.close();
				game.opponent = undefined;
				httpGet("/meet/" + game.myId, meetSomeone);
			});

			//If the user closes the tab, tell the other user
			window.onbeforeunload = function () {
				peerconn.close();
			};
		}

		//Receive the response from the server, potentially with another user's peer id
		function meetSomeone(res) {
			if (res.meet === "hold") {
				game.role = "host";
				game.board = Board.generate();
				gameInterface = new Interface(game);
				console.log("Waiting for a new friend");
			} else {
				game.role = "client";
				console.log("Meet ", res.meet);
				peerDataCommunication(game.player.connect(res.meet));
			}
		}

		//Establish peer connection with server
		function connectToServer(res) {
			if (res.env === "production") {
				game.player = new Peer({
					host: "/",
					port: 80,
					path: "/api",
					config: {
						"iceServers": [{url: "stun:stun.l.google.com:19302"}]
					}
				});
			} else {
				game.player = new Peer({host: "127.0.0.1", port: 3000, path: "/api", debug: 2});
			}
			//When the peer connection is established
			game.player.on("open", function (id) {
				game.myId = id;
				//Try to meet someone
				httpGet("/meet/" + id, meetSomeone);
			});
			//If someone calls, you answer
			game.player.on("connection", function (peerconn) {
				peerDataCommunication(peerconn);
			});
		}
	}
	
	return PeerConnect;
});
