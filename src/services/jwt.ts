import { User } from "@prisma/client";
import JWT from 'jsonwebtoken'
import { JWTUser } from "../interfaces";
class JWTServices{
    public static generateToken(user:User){
        const payload:JWTUser = {
            id:user.id,
            email: user.email
        }
        const token = JWT.sign(payload, '$uper$ecret@123')
        return token
    }

    public static decodeUserToken(token:string){
        try {
            return JWT.verify(token,'$uper$ecret@123') as JWTUser
        } catch (error) {
            return null
        }
        
    }
}

export default JWTServices