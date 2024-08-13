import express from 'express';
import { getUserFavoriteProperties, loginUser, registerUser, registerUsersFavoriteProperities } from '../controllers/user.controller.js';

const userRoute = express.Router()

userRoute.post('/register',registerUser)
userRoute.post('/login',loginUser)
userRoute.post('/user/favourites/:user_Id/:property_id',registerUsersFavoriteProperities)
userRoute.get('/user/favourites/:user_Id',getUserFavoriteProperties)

export {userRoute}