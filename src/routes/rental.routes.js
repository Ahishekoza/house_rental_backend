import express from 'express';
import { getTenantRentalHistory, rent_a_Property } from '../controllers/rental.controller.js';
const rentalRoute  =  express.Router();


rentalRoute.post('/rent-property',rent_a_Property)
rentalRoute.get('/rentals/:user_id',getTenantRentalHistory)


export {rentalRoute}