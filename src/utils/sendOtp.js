import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const sendOTP = async(email,otp)=>{
    try {
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.USER_EMAIL,
                pass:process.env.USER_PASS
            },
            secure:true
        })

        const mailOptions ={
            from:process.env.USER_EMAIL,
            to:email,
            subject:'Your OTP Code',
            text: `Your OTP code is ${otp}`,
        }

        await transporter.sendMail(mailOptions)

    } catch (error) {
        console.log(error);
    }
}