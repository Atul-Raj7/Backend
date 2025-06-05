import { asyncHandeler } from "../utils/asyncHandeler.js"
import { ApiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"

const generateAccessTokenAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken
        const refereshToken = user.generateRefereshToken

        user.refereshToken = refereshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refereshToken}
    }
    catch{
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandeler( async (req, res) => {
    // 1. get user details from frontend
    // 2. validation 
    // 3. check if user already exist: username, email
    // 4. check for images, check for avatar
    // 5. upload them to cloudinary, avatar
    // 6. create user object - create entry in db 
    // 7. remove password and refreshtoken field from response 
    // 8. check for user creation 
    // 9. return res


    const {fullName, email, username, password } = req.body
    console.log("email: ",email);


    // 1.

    // advanced way with .some

    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are necessary")
    }



    /*  Basic way

    if(fullName === ""){
        throw new ApiError(400, "Fullname is required")
    }
    */


    // 2. 

    // we are using "User" from models cuz `user.models.js` has mongoose which can talk with db to verify uniqueness


    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if(existedUser) {
        throw new ApiError(409, "User with email and password already exist")
    }

    // 3. 

    // multer gives the access to '.files' 


    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    
    // 4.

    
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // 5.


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }


    // 6.  


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : "",
        email,
        password,
        username: username.toLowerCase()
    })


    // 7. 


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    // 8. 


    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    // 9.

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandeler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // pasword check 
    // access and refresh token
    // send cookie

    const {email, username, password} = req.body

    if(!username || !email){
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refereshToken} = await generateAccessTokenAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user_id).select("-password -refereshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refereshToken", refereshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refereshToken
            },
            "User logged in Successfully"
        )
    )
    
})
export {registerUser}