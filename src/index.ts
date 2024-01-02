import {Message, server as WebSocketServer, connection} from "websocket";
import { IncomingMessage, SupportedMessage, UpvoteMessage } from "./messages/incomingMessages";
import { User, UserManager } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";
import {OutgoingMessage,SupportedMessage as OutgoingSupportedMessages} from "./messages/outgoingMessages";
import http from "http";

const server = http.createServer(function(request: any, response: any) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin: any) {
  return true;
}

const userManager = new UserManager();
const store = new InMemoryStore();

wsServer.on('request', function(request: any) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message: any) {
        // implement rate limiting logic
        if (message.type === 'utf8') {
            try{    
                messageHandler(connection, JSON.parse(message.utf8Data));
            }catch(e){
                console.log(e);
            }
        }
    });
    connection.on('close', function(reasonCode: any, description: any) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        console.log("Description : ", description);
    });
});


// THIS IS A MESSAGE HANDLER FUNCTION TO PERFORM A PARTICULAR TASK ACCORDING TO THE INCOMING REQUEST MESSAGE
function messageHandler(ws: connection, message: IncomingMessage){

    // IF A USER WANTS TO JOIN A ROOM
    if(message.type == SupportedMessage.JoinRoom){
        const payload = message.payload;
        console.log("user added");
        userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
    }

    // IF A USER WANTS TO SEND A MESSAGE IN A ROOM
    if(message.type == SupportedMessage.SendMessage){
        const payload = message.payload;
        const user = userManager.getUser(payload.userId, payload.roomId);
        if(!user){
            console.log("User not found in the DB");
            return;   
        }
        let chat = store.addChat(payload.userId, user.name, payload.roomId, payload.message);
        if(!chat) return;
        const outgoingPayload : OutgoingMessage = {
            type: OutgoingSupportedMessages.AddChat,
            payload:{
                roomId: payload.roomId,
                message: payload.message,
                name:user.name,
                upvotes:0,
                chatId: chat?.id
            }
        }
        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }

    // IF A USER WANTS TO UPVOTE A MESSAGE IN THE ROOM
    if(message.type == SupportedMessage.UpvoteMessage){
        const payload = message.payload;
        const chat = store.upvote(payload.userId, payload.roomId, payload.chatId);
        if(!chat) return;
        const outgoingPayload : OutgoingMessage = {
            type: OutgoingSupportedMessages.UpdateChat,
            payload:{
                chatId: payload.chatId, 
                roomId: payload.roomId,
                upvotes: chat.upvotes.length
            }
        }
        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }
}  