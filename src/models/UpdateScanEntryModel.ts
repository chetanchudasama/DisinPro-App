import { Moment } from 'moment';

export default class UpdateScanEntryModel {
    public scanEntryId: number;
    public userId: number;
    public inTime: Moment | null;
    public outTime: Moment | null;
    public amount: string;

    constructor() {
        this.inTime = null;
        this.outTime = null;
    }
}
