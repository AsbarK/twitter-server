import { User } from "@prisma/client";
import JWT from 'jsonwebtoken'
class JWTServices{
    public static generateToken(user:User){
        const payload = {
            id:user.id,
            email: user.email
        }
        const token = JWT.sign(payload, '$uper$ecret@123')
        return token
    }
}

export default JWTServices