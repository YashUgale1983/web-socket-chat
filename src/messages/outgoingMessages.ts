
export enum SupportedMessage{
    AddChat = "ADD_CHAT",
    UpdateChat = "UPDATE_CHAT"
}

type MessagePayload = {
    name: string,
    roomId: string,
    message: string,
    upvotes: number,
    chatId: string
}

export type OutgoingMessage = {
    type: SupportedMessage.AddChat,
    payload: MessagePayload
} | {
    type: SupportedMessage.UpdateChat,
    payload: Partial<MessagePayload>
}