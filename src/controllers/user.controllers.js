import { asyncHandeler } from "../utils/asyncHandeler.js"
import { ApiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"

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

export {registerUser}