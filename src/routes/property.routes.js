import express from 'express';
import { deleteImages, deleteProperty, getProperties, getSingleProperty, registerProperty, updateSingleProperty } from '../controllers/property.controller.js';
import { upload } from '../utils/multer.js';


const propertyRoute = express.Router()

propertyRoute.post('/create-property',upload.array('images',10),registerProperty)
propertyRoute.get('/properties',getProperties)
propertyRoute.get('/properties/:property_id',getSingleProperty)
propertyRoute.put('/properties/:property_id',upload.array('images',10),updateSingleProperty)
propertyRoute.put('/properties/:property_id/:image_public_id',deleteImages)
propertyRoute.delete('/properties/:property_id',deleteProperty)

export {propertyRoute}