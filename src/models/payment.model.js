import mongoose , {Schema} from 'mongoose'

const paymentSchema =  new Schema({
    propertyId:{
        type:String,
        required:true,
    },
    owner:{
        type:String,
        required:true,
    },
    tenant:{
        type:String,
        required:true,
    },
    totalAmount:{
        type:Number,
        required:true
    },
    customerId:{
        type:String,
        required:true
    },
    tenantPhoneNumber:{
        type:Number,
        required:true
    }


},{
    timestamps: true,
})


export const PaymentSchema = mongoose.model('Payment', paymentSchema)