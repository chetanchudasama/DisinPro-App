import { AxiosResponse } from "axios";
import axiosAPI from "@/api/AxiosPlugin";
import CompanyModel from "@/models/CompanyModel";
import CompanyBranchModel from '@/models/CompanyBranchModel';

export default class CompanyController {
  public static async getCompanies(
    email: string,
  ): Promise<CompanyModel[] | string> {
    const res: AxiosResponse = await axiosAPI.get<any>(
      "Company/GetCompanies?email=" + email,
    );
    return res && res.status === 200 ? res.data : res.statusText;
  }
  public static async getBranches(
    email: string,
  ): Promise<CompanyBranchModel[] | string> {
    const res: AxiosResponse = await axiosAPI.get<any>(
      "Company/GetBranches?email=" + email,
    );
    const cbModel: CompanyBranchModel[] = [
      {
        companyId: 1,
        branchId: 2,
        branchName: "Test",
        address: "Test addresss",
        city: "Bvn",
        state: "GJ",
        phoneNumber: "123123",
        optionalNumber: "123123",
        userEmail: "test@gmail.com"
    },
    {
      companyId: 2,
      branchId: 3,
      branchName: "Test 1",
      address: "Test address",
      city: "BH",
      state: "GJ",
      phoneNumber: "123123",
      optionalNumber: "123123",
      userEmail: "test@gmail.com"
  },
    {
      companyId: 3,
      branchId: 4,
      branchName: "Test 3",
      address: "Test address",
      city: "BH",
      state: "GJ",
      phoneNumber: "123123",
      optionalNumber: "123123",
      userEmail: "test@gmail.com"
  },
  ]
    return cbModel;
  }

  public static async addUpdateCompany(
    companyDetails: CompanyModel,
    userEmailId: string,
  ): Promise<CompanyModel | string> {
    const res: AxiosResponse = await axiosAPI.post<any>(
      "Company/CreateUpdateCompany?userEmailId=" + userEmailId,
      companyDetails,
    );
    return res && res.status === 200 ? res.data : res.statusText;
  }

  public static async addUpdateCompanyBranch(
    companyDetails: CompanyBranchModel,
  ): Promise<CompanyBranchModel | string> {
    const res: AxiosResponse = await axiosAPI.post<any>(
      "Company/CreateUpdateCompanyBranch",
      companyDetails,
    );
    return res && res.status === 200 ? res.data : res.statusText;
  }

  public static async deleteCompany(
    companyId: number,
  ): Promise<boolean> {
    const res: AxiosResponse = await axiosAPI.delete(
      "Company/DeleteCompany?companyId=" +
      companyId,
    );
    return res && res.status === 200 ? res.data : res.statusText;
  }

  public static async deleteBranch(
    branchId: number,
  ): Promise<boolean> {
    const res: AxiosResponse = await axiosAPI.delete(
      "Company/DeleteBranch?branchId=" +
      branchId,
    );
    return res && res.status === 200 ? res.data : res.statusText;
  }
}
