export const successResponse=async(res,message="Done",status=200,data=null)=>{
 return res.status(status).json({message,data:data})
}