import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import bodyParser from 'body-parser';
import { Users } from './user';
import cors from 'cors'
import { GraphqlContext } from '../interfaces';
import JWTServices from '../services/jwt';
import { Tweet } from './tweet';


export async function initServer(){
    const app = express()
    app.use(bodyParser.json())
    app.use(cors())

    const graphQlServer = new ApolloServer<GraphqlContext>({
        typeDefs:`
            ${Users.types}
            ${Tweet.types}
            type Query{
                ${Users.querys}
                ${Tweet.queries}
            }
            type Mutation {
                ${Tweet.mutations}
                ${Users.mutations}
            }
        `,
        resolvers:{
            Query:{
                ...Users.resolvers.queries,
                ...Tweet.resolvers.queries
            },
            Mutation:{
                ...Tweet.resolvers.mutations,
                ...Users.resolvers.mutations
            },
            ...Tweet.resolvers.extraResolvers,
            ...Users.resolvers.extraResolvers
            
            
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