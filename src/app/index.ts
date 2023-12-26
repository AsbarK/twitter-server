import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import bodyParser from 'body-parser';


export async function initServer(){
    const app = express()
    app.use(bodyParser.json())

    const graphQlServer = new ApolloServer({
        typeDefs:`
            type Query{
                sayHello : String
            }
        `,
        resolvers:{
            Query:{
                sayHello : ()=>`Hello from graphql server`
            }
        },
    });

    await graphQlServer.start();

    app.use('/graphql',expressMiddleware(graphQlServer))

    return app
}