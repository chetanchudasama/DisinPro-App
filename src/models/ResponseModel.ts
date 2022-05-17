export default class ResponseModel {
    public status: boolean;
    public message: string;
    public data: any;

    public constructor() {
        this.status = false;
        this.message = '';
        this.data = '';
    }
}
