import { prismaClient } from "../../client/db"
import { GraphqlContext } from "../../interfaces";
import { User } from "@prisma/client";
import UserServices from "../../services/user";


const queries = {
    verifyGoogleToken: async(parent:any,{token}:{token:string})=>{
        const resultToken = UserServices.verifyGoogleTokenService(token)
        return resultToken
    },

    getCurrentUser: async (parent:any,args:any,ctx:GraphqlContext) => {
        const id = ctx.user?.id
        if(!id){
            console.log('null',ctx.user)
            return null
        } 
        const user = UserServices.getUserByIdService(id)
        return user
    },
    getUserById :async (parent:any,{id}:{id:string},ctx:GraphqlContext) => {
        return UserServices.getUserByIdService(id)
    }
}

const extraResolvers ={
    User:{
        tweets: async(parent:User)=>{
            return await prismaClient.tweet.findMany({where:{authorId:parent.id}})
        }
    }
}

export const resolvers = {queries,extraResolvers}