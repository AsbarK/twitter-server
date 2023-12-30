import axios from "axios"
import { prismaClient } from "../client/db";
import JWTServices from "./jwt";


interface googleTokenDataType{
    iss?: string;
    azp?: string;
    aud?: string;
    sub?: string;
    email: string;
    email_verified?: boolean;
    nbf?: string;
    name: string;
    picture: string;
    given_name: string;
    family_name?: string;
    locale?: string;
    iat?: string;
    exp?: string;
    jti?: string;
    alg?: string;
    kid?: string;
    typ?: string;

}

class UserServices{
    public static async verifyGoogleTokenService(token:string){
        const googleToken = token
        const googleUrl = new URL('https://oauth2.googleapis.com/tokeninfo')
        googleUrl.searchParams.set('id_token',googleToken)

        const {data} = await axios.get<googleTokenDataType>(googleUrl.toString(),{responseType:"json"})


        const user =  await prismaClient.user.findUnique({where:{email: data.email}})

        if(!user){
            await prismaClient.user.create({
                data:{
                    email:data.email,
                    firstName: data.given_name,
                    lastName:data.family_name,
                    profileImageUrl: data.picture
                }
            })
        }
        const userInDb = await prismaClient.user.findUnique({where:{email: data.email}})
        if(!userInDb){
            throw new Error('No User Found Please Try Again')
        }
        const userToken = JWTServices.generateToken(userInDb)
        return userToken
    }
    public static async getUserByIdService(id:string){
        const user = await prismaClient.user.findUnique({where:{id:id}})
        return user
    }
    public static async followUserService(from:string,to:string) {
        return await prismaClient.follow.create({
            data:{
                follower:{
                    connect:{id: from}
                },
                following: {
                    connect:{id: to}
                }
            }
        })
    }
    public static async unFollowUserService(from:string,to:string) {
        return await prismaClient.follow.delete({where:{followerId_followingId:{followerId:from,followingId:to}}})
    }
}

export default UserServices;