import * as Yup from "yup";

export const loginSchema= Yup.object({
    username:Yup.string().min(2,"Username is too short").max(25,"Username is too long").required("This Field is Mandotary"),
    password:Yup.string().min(6,"Password must have atleast 6 character").required("This Field is Mandotary")
})