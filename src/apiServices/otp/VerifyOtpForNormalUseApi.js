import { baseApi } from "../baseApi";
import { slug } from "../../utils/Slug";

export const VerifyOtpForNormalUseApi = baseApi.injectEndpoints({
    endpoints:(builder) =>({
        VerifyOtpForNormalUse : builder.mutation({
            query({mobile,name,user_type_id,user_type,otp,is_approved_needed,type}){
                return {
                    url:`/api/app/userOtp/otp`,
                    method:'post',
                    headers:{
                        "slug":slug,
                        "Content-Type": "application/json"
                    },
                    body:{
                        "mobile" : mobile,
                        "name":name,
                        "otp" : otp,
                        "user_type_id" : user_type_id,
                        "user_type" : user_type,
                        "is_approved_needed" : is_approved_needed,
                        "type":type
                    }
                    
                   
                }
            }
        }),
        VerifyOtpForActivateWarranty : builder.mutation({
            query({mobile,name,user_type_id,user_type,otp,type}){
                console.log("VerifyOtpForActivateWarranty",mobile,name)
                return {
                    url:`/api/app/userOtp/otpWarranty`,
                    method:'post',
                    headers:{
                        "slug":slug,
                        "Content-Type": "application/json"
                    },
                    body:{
                        "mobile" : mobile,
                        "name":name,
                        "otp" : otp,
                        "user_type_id" : user_type_id,
                        "user_type" : user_type,
                        "type":type
                    }
                    
                   
                }
            }
        })
    })
});


export const {useVerifyOtpForNormalUseMutation,useVerifyOtpForActivateWarrantyMutation} = VerifyOtpForNormalUseApi

