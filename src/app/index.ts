import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import bodyParser from 'body-parser';
import { Users } from './user';
import cors from 'cors'
import { GraphqlContext } from '../interfaces';
import JWTServices from '../services/jwt';


export async function initServer(){
    const app = express()
    app.use(bodyParser.json())
    app.use(cors())

    const graphQlServer = new ApolloServer<GraphqlContext>({
        typeDefs:`
            ${Users.types}
            type Query{
                ${Users.querys}
            }
        `,
        resolvers:{
            Query:{
                ...Users.resolvers.queries
            }
        },
    });

    await graphQlServer.start();

    app.use('/graphql',expressMiddleware(graphQlServer,{
        context: async ({req,res}) => {
            return {
                user: req.headers.authorization ? JWTServices.decodeUserToken(req.headers.authorization.split('Bearer ')[1]):undefined
            }
        }
    }))

    return app
}