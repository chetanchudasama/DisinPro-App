export default class CompanyModel {
    public companyId: number;
    public companyName: string;
    public address: string;
    public city: string;
    public state: string;
    public phoneNumber: string;
    public optionalNumber: string;
    public userEmail: string;
    public userFirstName: string;
    public userLastName: string;
    public userId: number;

    constructor() {
        this.companyId = 0;
        this.userEmail = "";
    }
}
