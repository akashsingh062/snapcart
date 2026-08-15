import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendMail = async(to:string,subject:string,html:string)=>{
    try{
        const info = await transporter.sendMail({
            from: `"Snapcart" <${process.env.EMAIL}>`,
            to,
            subject,
            html,
        });
        console.log("Mail sent:",info.messageId);
        return true;
    }catch(error){
        console.error("Error sending mail:",error);
        return false;
    }
}