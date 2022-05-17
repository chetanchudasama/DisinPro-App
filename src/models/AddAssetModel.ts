import AssetModel from './AssetModel';

export default class AddAssetModel {
    public branchId: number;
    public actionUserEmail: string;
    public assets: AssetModel[];

    constructor() {
        this.branchId = 0;
    }
}
