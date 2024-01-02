import { connection } from "websocket";
import {OutgoingMessage} from "./messages/outgoingMessages";

export interface User{
    name: string;
    id: string;
    conn: connection
}

interface Room{
    users: User[]
}

export class UserManager{
    private rooms : Map<string, Room>;

    constructor(){
        this.rooms = new Map<string, Room>();
    }

    addUser(name: string, userId: string, roomId: string, socket: connection){
        if(! this.rooms.get(roomId)){
            this.rooms.set(roomId,{
                users: []
            })
        }

        this.rooms.get(roomId)?.users.push({
            id: userId,
            name,
            conn: socket
        })

        socket.on('close', (reasonCode: any, description: any)=> {
            console.log("Description : ", description);
            this.removeUser(roomId, userId);
        });
    }

    removeUser(roomId: string, userId: string){
        console.log("removed user");
        
        const users = this.rooms.get(roomId)?.users;
        if(users){
            users.filter(({id})=> id !== userId)
        }
    }

    getUser(userId: string, roomId:string): User | null{
        const users = this.rooms.get(roomId)?.users;
        if(users){
            const reqUser = users?.filter(({id})=> id===userId); // returns an array
            return reqUser[0];
        }

        return null;

        // alternate way -
        // const user = this.rooms.get(roomId)?.users.find((({id})=>id===userId));
        // return user ?? null ; 
    }   

    broadcast(roomId: string, userId: string, message: OutgoingMessage){
        const user = this.getUser(userId, roomId);
        if(!user){
            console.log("User not found in DB");
            return;
        }
        const room = this.rooms.get(roomId);
        if(!room){
            console.log("Room not found in DB");
            return;
        }

        room.users.forEach(({conn,id})=>{
            // if(id === userId) return;
            console.log("outgoing message : ", JSON.stringify(message));
            conn.sendUTF(JSON.stringify(message));
        })
    }
}
