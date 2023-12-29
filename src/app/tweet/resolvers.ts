import { Tweet } from "@prisma/client"
import { prismaClient } from "../../client/db"
import { GraphqlContext } from "../../interfaces"
import {S3Client,PutObjectCommand} from "@aws-sdk/client-s3"
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import TweetServices from "../../services/tweet"
import UserServices from "../../services/user"


interface CreateTweetData{
    content: string
    imageUrl?: string
}
const s3Client = new S3Client({
    region: process.env.S3_REGION,
    // credentials:{accessKeyId:String(process.env.S3_ACCESS_KEY),secretAccessKey:String(process.env.S3_ACCESS_SECRET)}
})

const mutations = {
    CreateTweet:async(parent:any,{payload}:{payload:CreateTweetData},ctx:GraphqlContext)=>{
        if(!ctx.user) throw new Error('Not authenticated')
        const tweet = await TweetServices.createTweetService({...payload,userId:ctx.user.id})
        return tweet
    }
}
const queries = {
    GetAllTweets:async(parent:any,args:any,ctx:GraphqlContext)=>{
        return TweetServices.getAllTweetsService()
    },
    GetSignedUrls:async (parent:any,{imageType}:{imageType:String},ctx:GraphqlContext) => {
        if(!ctx.user || !ctx.user.id) throw new Error('UnAuthorized')

        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${ctx.user.id}/tweets/${Date.now().toString()}.${imageType}`,
            
        })

        const signedUrl = await getSignedUrl(s3Client,putObjectCommand)
        return signedUrl
    }
}

const extraResolvers = {
    Tweet:{
        author:async(parent:Tweet)=>{
            return await UserServices.getUserByIdService(parent.authorId)
        }
    }
}

export const resolvers = {mutations,extraResolvers,queries}