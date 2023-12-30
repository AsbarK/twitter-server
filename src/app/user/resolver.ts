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
        },
        followers: async(parent:User)=>{ 
            const result =  await prismaClient.follow.findMany({where:{following:{id:parent.id}},include:{follower:true,following:true}})
            return result.map((res)=>{
                return res.follower
            })
        },
        following: async(parent:User)=>{
            const result =  await prismaClient.follow.findMany({where:{follower:{id:parent.id}},include:{follower:true,following:true}})
            return result.map((res)=>{
                return res.following
            })
        }
    }
}

const mutations ={
    followUser:async (parent:any,{to}:{to:string},ctx:GraphqlContext) => {
        if(!ctx.user || !ctx.user.id) throw new Error('Not Authorized')
        await UserServices.followUserService(ctx.user.id,to)
        return true
    },
    unFollowUser:async (parent:any,{to}:{to:string},ctx:GraphqlContext) => {
        if(!ctx.user || !ctx.user.id) throw new Error('Not Authorized')
        await UserServices.unFollowUserService(ctx.user.id,to)
        return true
    }

}

export const resolvers = {queries,extraResolvers,mutations}