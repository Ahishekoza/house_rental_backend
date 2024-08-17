import mongoose , {Schema} from 'mongoose';

const rentalSchema = new Schema({
    property_id :{
        type : mongoose.Schema.Types.ObjectId,
        ref:'Property'
    },
    tenant:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    start_date:{
        type:Date,
        required: true
    },
    end_date:{
        type:Date,
        required: true
    },
    total_cost:{
        type:Number,
        required: true
    },
    status:{
        type:String,
        enum:['active', 'completed', 'cancelled' ],
        default: 'active'
    }
})



export const RentalSchema = mongoose.model('Rental',rentalSchema)