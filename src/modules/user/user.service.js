import { UserModel } from "../../DB/model/user.model.js";
import { hashPassword, encryptPhone } from "../../common/utils/security.js";
export const profile = (id) => {
  const user = users.find((ele) => ele.id == id);
  return user;
};
export const createUserService = async (userData) => {
  const { name, email, password, phone } = userData;

  // check email
  const isEmailExist = await UserModel.findOne({ email });
  if (isEmailExist) {
    throw new Error("EMAIL_EXISTS");
  }

  // hash password
  const hashedPassword = await hashPassword(password);

  // encrypt phone
  const encryptedPhone = encryptPhone(phone);

  // create user
  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    phone: encryptedPhone,
  });

  return user;
  console.log("PHONE VALUE >>>", phone, typeof phone);

};
