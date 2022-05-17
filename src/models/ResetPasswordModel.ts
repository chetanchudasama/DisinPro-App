export default class ResetPasswordModel {
    public token: string | Array<string | null>;
    public password: string;
    public verifyPassword: string;
}
