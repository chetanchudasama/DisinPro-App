import { AxiosResponse } from "axios";
import axiosAPI from "@/api/AxiosPlugin";
import AddAssetModel from '@/models/AddAssetModel';
import AssetTypeModel from '@/models/AssetTypeModel';

export default class AssetController {
    public static async addListOFAssets(assetDetail: AddAssetModel): Promise<any> {
        const res: AxiosResponse = await axiosAPI.post(
          "Asset/AddListOfAssets",
          assetDetail,
        );
        return res && res.status === 200 ? res.data : res.statusText;
    }

    public static async getAssets(email: string): Promise<any[]> {
      const res: AxiosResponse = await axiosAPI.get<any[]>(
        "Asset/GetAssetList?companyEmail=" + email,
      );
      return res && res.status === 200 ? res.data : res.statusText;
    }

    public static async getAssetType(): Promise<AssetTypeModel[]> {
      const res: AxiosResponse = await axiosAPI.get<AssetTypeModel[]>(
        "Asset/GetAssetType",
      );
      return res && res.status === 200 ? res.data : [];
    }

    public static async getScanEntries(
      email: string,
    ): Promise<any[] | string> {
      const res: AxiosResponse = await axiosAPI.get<any>(
        "ScanEntry/GetScanEntries?companyEmail=" + email,
      );
      return res && res.status === 200 ? res.data : res.statusText;
    }

    public static async deleteAssetsDetail(
      assetId: any[],
    ): Promise<boolean> {
      const res: AxiosResponse = await axiosAPI.post(
        "Asset/DeleteAssetList",
        assetId,
      );
      return res && res.status === 200 ? res.data : res.statusText;
    }
}
