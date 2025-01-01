import { Resend } from "resend";
import dotev from 'dotenv'
dotev.config()

const resend = new Resend(process.env.RESEND_API_KEY)

export default resend;