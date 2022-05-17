import UserTypeModel from './UserTypeModel';
import CompanyModel from './CompanyModel';

export default class UserModel {
    public userId: number;
    public firstName: string;
    public lastName: string;
    public email: string;
    public password: string;
    public registrationDate: string;
    public lastUpdateDate: string;
    public isActive: boolean;
    public userType: UserTypeModel;
    public company: CompanyModel;
    public branchId: number;
}
