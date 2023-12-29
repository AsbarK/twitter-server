import { prismaClient } from "../client/db"


interface CreateTweetData{
    content: string
    imageUrl?: string
    userId:string
}

class TweetServices{
    public static async createTweetService(payload:CreateTweetData){
        const tweet = await prismaClient.tweet.create({
            data:{
                content:payload.content,
                imageUrl:payload.imageUrl,
                author: {connect:{id: payload.userId}}
            }
        })
        return tweet
    }

    public static async getAllTweetsService(){
        return await prismaClient.tweet.findMany({orderBy:{createdAt:'desc'}})
    }
}

export default TweetServices