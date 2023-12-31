
export type UserId = string;

export interface Chat{
    id: string;
    userId: UserId;
    name: string;
    message: string;
    upvotes: UserId[]; // to store who has upvoted what
}


// Providing an interface using abstract class 'Store' to structure 'InMemoryStore' class
// Instead of using an abstract class, we can also use an interface to define structure i.e. method signatures for 'InMemoryStore' class. 
export abstract class Store{
    constructor(){}

    initRoom(roomId: string){}
    
    getChats(roomId: string, limit: number, offset: number){}

    addChat(userId: UserId, name: string, roomId: string, message: string){}

    upvote(userId: UserId, roomId: string, chatId: string){}
}

// alternate way using interface
// export interface Store {
//     initRoom(roomId: string): void;
//     getChats(roomId: string, limit: number, offset: number): Chat[];
//     addChat(userId: UserId, name: string, roomId: string, message: string): void;
//     upvote(userId: UserId, roomId: string, chatId: string): void;
//   }