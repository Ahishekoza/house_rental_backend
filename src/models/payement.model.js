import mongoose , {Schema} from 'mongoose'

const paymentSchema =  new Schema({
    rented_property:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Rental'
    },
    
},{
    timestamps: true,
})


const PaymentSchema = mongoose.model('Payment', paymentSchema)