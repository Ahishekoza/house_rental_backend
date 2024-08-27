import express from 'express';
import { deleteUser, getUserFavoriteProperties, loginUser, registerUser, registerUsersFavoriteProperities, setUserPassword, verifyOTP } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const userRoute = express.Router()

userRoute.post('/register',registerUser)
userRoute.post('/verify-otp',verifyOTP)
userRoute.get('/verify-token',verifyToken,(req,res)=>{
    try {
        res.status(200).json({message:"Token Valid", success: true});
    } catch (error) {
        res.status(404).json({message:"Token expired",success: false});
    }

})
userRoute.post('/set-user-password',setUserPassword)
userRoute.post('/login',loginUser)
userRoute.post('/user/favourites/:user_Id/:property_id',registerUsersFavoriteProperities)
userRoute.get('/user/favourites/:user_Id',getUserFavoriteProperties)
userRoute.post('/user/delete',deleteUser)
export {userRoute}