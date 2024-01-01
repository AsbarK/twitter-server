import { prismaClient } from "../client/db"
import { redisClient } from "../client/redis"


interface CreateTweetData{
    content: string
    imageUrl?: string
    userId:string
}

class TweetServices{
    public static async createTweetService(payload:CreateTweetData){
        const rateLimitFlag = await redisClient.get(`Rate_Limit:${payload.userId}`)
        if(rateLimitFlag) throw new Error('Please wait for 10 sec .....')
        const tweet = await prismaClient.tweet.create({
            data:{
                content:payload.content,
                imageUrl:payload.imageUrl,
                author: {connect:{id: payload.userId}}
            }
        })
        await redisClient.setex(`Rate_Limit:${payload.userId}`,10,1)
        await redisClient.del('AllTweets')
        return tweet
    }

    public static async getAllTweetsService(){
        const cachedTweets = await redisClient.get('AllTweets')
        if(cachedTweets !== '{}' && cachedTweets) {
            return JSON.parse(cachedTweets)
        }

        const tweets = await prismaClient.tweet.findMany({orderBy:{createdAt:'desc'}})
        await redisClient.set('AllTweets',JSON.stringify(tweets))
        return tweets
    }
}

export default TweetServices