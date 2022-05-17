import Confirmation from '@/components/Confirmation.vue';
import moment from "moment";

export default class Shared {
    public static APIBaseURL: string = 'http://localhost:3000/';
    // public static APIBaseURL: string = 'http://192.168.1.82/DisinPro/api/';
    // public static APIBaseURL: string = 'http://web1.anasource.com/disinproapi/api/';

    // alias ls stands for local storage
    public static lsTokenName: string = 'accessToken';
    public static lsUserEmailId: string = 'userEmailId';
    public static lsUserName: string = 'userName';
    public static lsUserType: string = 'userType';
    public static lsUserIsActive: string = 'userActive';
    public static lsCompanyName: string = 'companyName';

    // globally defined confirmation popup
    public static confirmationPopup: Confirmation;

    public static dateFormatForDatePicker: string = "YYYY-MM-DD";

    public static DateTimeFormat: string =  "DD/MM/YYYY HH:mm";

    public static SnackbarMessageTimeout: number = 7000;

    // set focus to first element which has validation error
    public static setValidationFocus(el: HTMLElement): void {
        const errorItem: any = el.querySelector(".error--text");
        if (errorItem) {
            errorItem.focus();
            errorItem.getElementsByTagName("input")[0].focus();
        }
    }

    public static getFormatedDate(dateValue: moment.Moment, format: string): string {
        if (dateValue) {
            if (moment.isMoment(dateValue) && dateValue.isValid()) {
                return dateValue.format(format);
            } else {
                return "--/--/----";
            }
        }
        return "--/--/----";
    }

    public static insertSpaceInEnumName(text: string) {
        // insert space before each capital letter in the word.
        // Trim is used to remove initial/first space added in word started with capital letter.
        return text.replace(/([A-Z])/g, ' $1').trim();
    }

    public static clearLocalStorage() {
        localStorage.setItem(Shared.lsTokenName, "");
        localStorage.setItem(Shared.lsUserEmailId, "");
        localStorage.setItem(Shared.lsUserName, "");
        localStorage.setItem(Shared.lsUserType, "");
        localStorage.setItem(Shared.lsUserIsActive, "");
        localStorage.setItem(Shared.lsCompanyName, "");
    }
}
