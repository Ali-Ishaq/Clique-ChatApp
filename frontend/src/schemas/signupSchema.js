import * as Yup from "yup";

export const signUpSchema= Yup.object({
    fullName:Yup.string().min(2,"Name is too short").max(25,"Name is too long").required("This Field is Mandotary"),
    username:Yup.string().min(2,"Username is too short").max(25,"Username is too long").required("This Field is Mandotary"),
    email:Yup.string().email().required("This Field is Mandotary"),
    password:Yup.string().min(6,"Password must have atleast 6 character").required("This Field is Mandotary")
})