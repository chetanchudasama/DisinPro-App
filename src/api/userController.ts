import { AxiosResponse } from "axios";
import axiosAPI from "@/api/AxiosPlugin";
import UserModel from "@/models/UserModel";
import UserTypeModel from '@/models/UserTypeModel';

export default class UserController {
  public static async getUsers(
    email: string,
  ): Promise<UserModel[] | string> {
    const res: AxiosResponse = await axiosAPI.get<any>(
      "User/GetUsers?email=" + email,
    );
    return res && res.status === 200 ? res.data : res.statusText;
  }

  public static async addUpdateUser(
    userDetails: UserModel,
    userEmail: string,
  ): Promise<UserModel | string> {
    const res: AxiosResponse = await axiosAPI.post<any>(
      "User/AddUpdateUser?userEmail=" + encodeURIComponent(userEmail),
      userDetails,
    );
    return res && res.status === 200 ? res.data : res.statusText;
  }

  public static async deleteUser(
    userId: number,
  ): Promise<boolean> {
    const res: AxiosResponse = await axiosAPI.delete(
      "User/DeleteUser?userId=" +
      userId,
    );
    return res && res.status === 200 ? res.data : res.statusText;
  }

  public static async getUserType(): Promise<UserTypeModel[]> {
    const res: AxiosResponse = await axiosAPI.get<UserTypeModel[]>(
      "User/GetUserType",
    );
    const obj = [
      {
        userTypeId: 1,
        type: "CompanyAdmin,"
      },
      {
        userTypeId: 2,
        type: "CompanyAdmin,"
      },
  ]
    return obj;
  }

  public static async resendOperatorEmail(
    operatorEmail: string,
  ): Promise<string> {
    const res: AxiosResponse = await axiosAPI.post<any>(
      "User/ResendOperatorEmail?operatorEmail=" + operatorEmail,
    );
    return res && res.status === 200 ? res.data : res.statusText;
  }
}
