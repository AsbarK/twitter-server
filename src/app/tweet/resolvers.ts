import { Tweet } from "@prisma/client"
import { prismaClient } from "../../client/db"
import { GraphqlContext } from "../../interfaces"

interface CreateTweetData{
    content: string
    imageUrl?: string
}

const mutations = {
    CreateTweet:async(parent:any,{payload}:{payload:CreateTweetData},ctx:GraphqlContext)=>{
        if(!ctx.user) throw new Error('Not authenticated')
        const tweet = await prismaClient.tweet.create({
            data:{
                content:payload.content,
                imageUrl:payload.imageUrl,
                author: {connect:{id: ctx.user.id}}
            }
        })
        return tweet
    }
}
const queries = {
    GetAllTweets:async(parent:any,args:any,ctx:GraphqlContext)=>{
        return await prismaClient.tweet.findMany()
    }
}

const extraResolvers = {
    Tweet:{
        author:async(parent:Tweet)=>{
            return await prismaClient.user.findUnique({where:{id:parent.authorId}})
        }
    }
}

export const resolvers = {mutations,extraResolvers,queries}