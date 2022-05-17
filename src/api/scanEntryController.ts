import { AxiosResponse } from "axios";
import axiosAPI from "@/api/AxiosPlugin";
import ScanEntryModel from '@/models/ScanEntryModel';

export default class ScanEntryController {
    public static async getScanEntries(
        email: string,
        branchId: number,
        userId: number,
        assetTypeId: number,
        fromDate: string,
        toDate: string,
    ): Promise<ScanEntryModel[] | string> {
        const res: AxiosResponse = await axiosAPI.get<any>(
            "ScanEntry/GetScanEntries?userEmail=" + email + '&branchId=' + branchId + '&userId=' + userId + '&assetTypeId=' + assetTypeId + '&fromDate=' + fromDate + '&toDate=' + toDate,
        );
        return res && res.status === 200 ? res.data : res.statusText;
    }

    public static async updateScanEntry(scanEntryDetails: ScanEntryModel, userEmail: string): Promise<ScanEntryModel | string> {
        const res: AxiosResponse = await axiosAPI.post<ScanEntryModel>(
            "ScanEntry/UpdateScanEntry?userEmailId=" + encodeURIComponent(userEmail),
            scanEntryDetails,
        );
        return res && res.status === 200 ? res.data : res.statusText;
    }
}

