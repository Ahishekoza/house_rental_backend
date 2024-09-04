import express from 'express';
import { checkThePropertyAvailability, getTenantRentalHistory, rentAProperty } from '../controllers/rental.controller.js';
const rentalRoute  =  express.Router();

rentalRoute.post('/check-availability', checkThePropertyAvailability)
rentalRoute.post('/rent-property',rentAProperty)
rentalRoute.get('/rentals/:user_id',getTenantRentalHistory)


export {rentalRoute}