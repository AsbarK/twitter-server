import { Tweet } from "@prisma/client"
import { prismaClient } from "../../client/db"
import { GraphqlContext } from "../../interfaces"
import {S3Client,PutObjectCommand} from "@aws-sdk/client-s3"
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'

require('dotenv').config()

interface CreateTweetData{
    content: string
    imageUrl?: string
}
const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials:{accessKeyId:String(process.env.S3_ACCESS_KEY),secretAccessKey:String(process.env.S3_ACCESS_SECRET)}
})

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
        return await prismaClient.tweet.findMany({orderBy:{createdAt:'desc'}})
    },
    GetSignedUrls:async (parent:any,{imageType}:{imageType:String},ctx:GraphqlContext) => {
        if(!ctx.user || !ctx.user.id) throw new Error('UnAuthorized')

        const putObjectCommand = new PutObjectCommand({
            Bucket: 'asbar-twitter-dev',
            Key: `uploads/${ctx.user.id}/tweets/${Date.now().toString()}.${imageType}`,
            
        })

        const signedUrl = await getSignedUrl(s3Client,putObjectCommand)
        return signedUrl
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