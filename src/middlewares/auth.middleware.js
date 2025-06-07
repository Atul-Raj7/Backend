import { ApiError } from "../utils/apiError";
import { asyncHandeler } from "../utils/asyncHandeler";
import jwt from "jsonwebtoken"
import { user } from "../models/user.model";


export const verifyJWT = asyncHandeler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if (!token ) {
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_EXPIRY)
    
        await user.findById(decodedToken?._id).select("-password -refereshToken")
    
        if(!user) {
            throw new ApiError(401, "Invalid AccessToken")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})