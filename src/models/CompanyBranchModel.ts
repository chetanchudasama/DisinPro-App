export default class CompanyBranchModel {
    public companyId: number;
    public branchId: number;
    public branchName: string;
    public address: string;
    public city: string;
    public state: string;
    public phoneNumber: string;
    public optionalNumber: string;
    public userEmail: string;

    constructor() {
        this.branchId = 0;
        this.userEmail = "";
    }
}
