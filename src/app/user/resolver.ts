import axios from "axios"
import { prismaClient } from "../../client/db"
import JWTServices from "../../services/jwt";

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

const queries = {
    verifyGoogleToken: async(parent:any,{token}:{token:string})=>{
        const googleToken = token
        const googleUrl = new URL('https://oauth2.googleapis.com/tokeninfo')
        googleUrl.searchParams.set('id_token',googleToken)

        const {data} = await axios.get<googleTokenDataType>(googleUrl.toString(),{responseType:"json"})

        console.log(data)

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
}

export const resolvers = {queries}