import AssetModel from './AssetModel';

export default class ScanEntryModel {
    public scanEntryId: number;
    public assetId: number;
    public branchId: number;
    public userId: number;
    public inTime: moment.Moment | null;
    public outTime: moment.Moment | null;
    public createdDate: moment.Moment;
    public modifiedBy: number;
    public modifiedDate: moment.Moment | null;
    public amount: string;
    public assetDetail: AssetModel;
}
