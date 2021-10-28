import {gql} from "apollo-server-express";

const messageSchema = gql`
    type Message {
        id: ID!
        text: String!
        userId: ID!
        timestamp: Float #13자리 숫자(graphql 에서 13자리의 정수를 지원하지 않으므로 Float 으로.
    }
    
    extend type Query {
        messages(cursor: ID): [Message!]! # getMessages
        message(id: ID!): Message! # getMessage
    }
    
    extend type Mutation {
        createMessage(text: String!, userId: ID!): Message!
        updateMessage(id: ID!, text: String!, userId: ID!): Message!
        deleteMessage(id: ID!, userId: ID!): ID!
    }
`
export default messageSchema
