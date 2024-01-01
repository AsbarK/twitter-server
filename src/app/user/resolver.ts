import { prismaClient } from "../../client/db"
import { GraphqlContext } from "../../interfaces";
import { User } from "@prisma/client";
import UserServices from "../../services/user";
import { redisClient } from "../../client/redis";


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
        },
        recomendeUsers: async(parent:User,args:any,ctx:GraphqlContext)=>{
            if (!ctx.user) return [];
            const cachedValue = await redisClient.get(`RecomendedUsers:${ctx.user.id}`)
            if(cachedValue) return JSON.parse(cachedValue)
            const users = []
            const myFollowing = await prismaClient.follow.findMany({where:{
                follower:{id:ctx.user?.id}
            },
            include:{
                following:{include:{followers:{include:{following:true}}}}
            }
            },)
            for(const followings of myFollowing){
                for(const followingOfFollowing of followings.following.followers){
                    if (
                        followingOfFollowing.following.id !== ctx.user.id &&
                        myFollowing.findIndex(
                          (e) => e?.followingId === followingOfFollowing.following.id
                        ) < 0
                      ) {
                        users.push(followingOfFollowing.following);
                    }
                }
            }
            await redisClient.set(`RecomendedUsers:${ctx.user.id}`,JSON.stringify(users))

            return users
        }
    }
}

const mutations ={
    followUser:async (parent:any,{to}:{to:string},ctx:GraphqlContext) => {
        if(!ctx.user || !ctx.user.id) throw new Error('Not Authorized')
        await UserServices.followUserService(ctx.user.id,to)
        await redisClient.del(`RecomendedUsers:${ctx.user.id}`)
        return true
    },
    unFollowUser:async (parent:any,{to}:{to:string},ctx:GraphqlContext) => {
        if(!ctx.user || !ctx.user.id) throw new Error('Not Authorized')
        await UserServices.unFollowUserService(ctx.user.id,to)
        await redisClient.del(`RecomendedUsers:${ctx.user.id}`)
        return true
    }

}

export const resolvers = {queries,extraResolvers,mutations}