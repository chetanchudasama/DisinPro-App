import { AxiosResponse } from "axios";
import axiosAPI from "@/api/AxiosPlugin";
import UserModel from "@/models/UserModel";
import ResetPasswordModel from '@/models/ResetPasswordModel';

export default class AccountController {
  public static async userLogin(userDetail: UserModel): Promise<any> {
    const res: AxiosResponse = await axiosAPI.post<any>(
      "posts",
      userDetail,
    );
    debugger
    const obj = {
      data: {
        user: {
          "userId": 12,
        "firstName": "Jerry",
        "lastName": "Beggar",
        "email": "JerryBeggar@gmail.com",
        "password": "1231321",
        "registrationDate": "2021-09-01T12:00:00-04:00",
        "lastUpdateDate": "2021-08-01T12:00:00-04:00",
        "isActive": true,
        "userType": {
          "userTypeId": 1,
          "type": "CompanyAdmin"
        },
        "company": {
          "companyId": 1,
          "companyName": "test",
          "address": "test add",
          "city": "Ahm",
          "state": "G",
          "phoneNumber": "1231312",
          "optionalNumber": "12313123",
          "userEmail": "test@gmail.com",
          "userFirstName": "test123",
          "userLastName": "test 123123",
          "userId": 123
        },
        "branchId": 1,
        "id": 1
        },
      },
      token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXNzYWdlIjoiSldUIFJ1bGVzISIsImlhdCI6MTQ1OTQ0ODExOSwiZXhwIjoxNDU5NDU0NTE5fQ.-yIVBD5b73C75osbmwwshQNRC7frWUYrqaTjTpza2y4"
    };
    return obj;
  }

  public static async fogotPassword(userDetail: UserModel): Promise<any> {
    const res: AxiosResponse<any> = await axiosAPI.post<any>(
      "Account/FogotPassword",
      userDetail,
    );
    return res.data;
  }

  public static async resetPassword(resetPasswordDetails: ResetPasswordModel): Promise<any> {
    const res: AxiosResponse<any> = await axiosAPI.post<any>(
      "Account/ResetPassword",
      resetPasswordDetails,
    );
    return res.data;
  }
}
