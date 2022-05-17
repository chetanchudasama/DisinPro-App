<template>
  <div>
    <v-container fluid fill-height class="px-6">
      <v-layout>
        <v-flex xs12>
          <v-fade-transition mode="out-in" v-bar>
            <v-layout>
              <v-flex xs12>
                <v-layout class="align-center mt-4 mb-6">
                  <v-flex xs4>
                <v-select
                  :items="locationListTemp"
                  item-text="branchName"
                  item-value="branchId"
                  label="Locations"
                  dense
                  v-model.trim="selectedLocationId"
                  @change="filterUsersByLocation()"
                  class="pt-1"
                  hide-details          
                ></v-select>
                </v-flex>
                  <v-spacer></v-spacer>
                  <v-flex xs4>
                <div class="btn-wrap my-4 text-right">
                  <v-btn min-width="150" class="primary" @click="showUserDialog = true">Add User</v-btn>
                </div>
                  </v-flex>
                </v-layout>
                <v-data-table
                  :headers="headers"
                  :items="userList"
                  item-key="userId"
                  class="elevation-1 grid-table user-table"
                >
                 <template v-slot:item.firstName="{ item }">
                  {{ item.firstName + ' ' + item.lastName }}
                </template>
                <template v-slot:item.email="{ item }">
                  {{ item.email }}
                </template>
                <template v-slot:item.branchId ="{ item }">
                  {{ getLocationName(item.branchId) }}
                </template>
                <template v-slot:item.userType ="{ item }">
                  {{ getAssetType(item.userType) }}
                </template>
                <template v-slot:item.registrationDate ="{ item }">
                  {{ getFormatedDate(item.registrationDate) }}
                </template>
                <template v-slot:item.isActive ="{ item }">
                  {{ item.isActive ? 'Yes' : 'No' }}
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn class="icon-btn edit-btn" @click="onEditUserDetails(item)">
                    <img src="/img/edit-icon.svg" alt="Edit Icon" />
                  </v-btn>
                  <v-btn class="icon-btn delete-btn" @click="deletePopup(item.userId)">
                    <img src="/img/delete-icon.svg" alt="Delete Icon" />
                  </v-btn>
                  <v-btn class="icon-btn sendEmail-btn" @click="sendEmailPopups(item.email)">
                    <img src="/img/send-emai-icon.svg" alt="Send Email" />
                  </v-btn>
                </template>
                </v-data-table>
              </v-flex>
            </v-layout>
          </v-fade-transition>
        </v-flex>
      </v-layout>
    </v-container>
    <v-dialog
      v-if="showUserDialog"
      v-model="showUserDialog"
      max-width="800"
      content-class="form-dailog"
      persistent
    >
      <AddUpdateUser
        :user="user"
        :userTypeList="userTypeList"
        :locationList="locationList"
        v-on:onSaveUserDetail="saveUserDetail"
        v-on:onUserDialogClose="closeDialog"
      ></AddUpdateUser>
    </v-dialog>
    <v-snackbar :timeout="snackbarTimeout" v-model="snackbar" left bottom class="snack-bar">
      {{ snackbarText }}
      <v-btn dark text @click.native="snackbar = false" color="secondary" class="icon-btn">
        <img src="/img/close-icon-black.svg" alt="close icon" />
      </v-btn>
    </v-snackbar>
  </div>
</template>

<style scoped>
.edit-btn {
  width: 17px;
  height: 17px;
}
.delete-btn {
  width: 22px;
  height: 22px;
}
.sendEmail-btn {
  width: 28px;
  height: 28px;
}
</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import UserModel from "@/models/UserModel";
import AddUpdateUser from "@/components/AddUpdateUser.vue";
import Shared from "../common/shared";
import UserController from "../api/userController";
import { UserType } from "../common/enums";
import UserTypeModel from '../models/UserTypeModel';
import moment from "moment";
import CompanyBranchModel from '../models/CompanyBranchModel';
import CompanyController from '../api/companyController';

@Component({
  components: { AddUpdateUser },
})
export default class User extends Vue {
  private user: UserModel = new UserModel();
  private snackbarTimeout: number = Shared.SnackbarMessageTimeout;
  private snackbar: boolean = false;
  private snackbarText: string = "";
  private showUserDialog: boolean = false;
  private userList: UserModel[] = [];
  private userListTemp: UserModel[] = [];
  private userTypeList: UserTypeModel[] = [];
  private locationList: CompanyBranchModel[] = [];
  private locationListTemp: CompanyBranchModel[] = [];
  private userEmailId = localStorage.getItem(Shared.lsUserEmailId);
  private selectedLocationId: number = 0;

  private headers: any = [
    { text: "Name", value: "firstName" },
    { text: "Email", value: "email" },
    { text: "Branch", value: "branchId" },
    { text: "Type", value: "userType" },
    { text: "Registration Date", value: "registrationDate" },
    { text: "Is Active", value: "isActive" },
    { text: "", value: "action", align: "end", sortable: false },
  ];

  private created() {
    const userType: string | null = localStorage.getItem(
      Shared.lsUserType,
    );
    if (this.userEmailId && userType === UserType[UserType.CompanyAdmin]) {
      this.getUsers(this.userEmailId);
      this.getLocationList(this.userEmailId);
    } else {
      this.$router.push("/login");
    }
    this.getUserType();
  }

  private getUsers(userEmailId: string) {
    UserController.getUsers(userEmailId).then(
      (res: UserModel[] | string) => {
        if (typeof res !== "string") {
          this.userList = JSON.parse(JSON.stringify(res));
          this.userListTemp = res;
          // manage response
        } else {
          // handle error
        }
      },
    );
  }

  private getLocationList(userEmailId: string) {
    CompanyController.getBranches(userEmailId).then(
      (res: CompanyBranchModel[] | string) => {
        if (typeof res !== "string") {
          this.locationList = res;
          this.locationListTemp = JSON.parse(JSON.stringify(res));
          if (res.length > 1) {
            this.locationListTemp.unshift(
              Object.assign(new CompanyBranchModel(), {
                branchId: 0,
                branchName: 'All',
              }),
            );
          } else if (res.length === 1) {
            this.selectedLocationId = this.locationList[0].branchId;
          }
        } else {
          // handle error
        }
      },
    );
  }

  private onEditUserDetails(user: UserModel) {
    this.user = user;
    this.showUserDialog = true;
  }

  private closeDialog() {
    this.showUserDialog = false;
    this.user = new UserModel();
  }

  private deletePopup(userId: number) {
    Shared.confirmationPopup.open(
      "Are you sure you want to delete?",
      "",
      "",
      "",
      "",
      this,
      "deleteUser",
      userId,
    );
  }

  private deleteUser(userId: number) {
    UserController.deleteUser(userId)
      .then((res: any) => {
        if (typeof res !== "string") {
          this.$emit("onSaveUserDetail", res);
        } else {
          // show res message
          // handle error
        }
      })
      .catch((err: any) => {
        // TODO: handle error
        // this.isLoading = false;
      });
  }

  private saveUserDetail(userDetail: UserModel) {
    this.showUserDialog = false;
    this.snackbarText = "User Detail Saved Successfully.";
    this.snackbar = true;
    const index: number = this.userList.findIndex(
      (c: UserModel) => c.userId === userDetail.userId,
    );
    if (index !== -1) {
      this.userList.splice(index, 1, userDetail);
    } else {
      this.userList.push(userDetail);
    }
  }

  private getUserType() {
    UserController.getUserType()
      .then((res: UserTypeModel[]) => {
        this.userTypeList = res;
      })
      .catch((err: any) => {
        // TODO: handle error
      });
  }

  private getFormatedDate(createdAt: moment.Moment): string {
    if (createdAt) {
        return Shared.getFormatedDate(moment(createdAt), Shared.DateTimeFormat);
    }
    return "";
  }

  private getAssetType(assetType) {
    return Shared.insertSpaceInEnumName(assetType.type);
  }

  private getLocationName(branchId: number): string | undefined {
    if (this.locationList.length > 0) {
      return this.locationList
        .find((x) => x.branchId === branchId)!.branchName;
    }
  }

  private sendEmailPopups(userEmail: string) {
    Shared.confirmationPopup.open(
      "User code will be sent to " + userEmail,
      "",
      "",
      "",
      "",
      this,
      "sendUserCode",
      userEmail,
      '',
      true,
    );
  }

  private sendUserCode(userEmail: string) {
    UserController.resendOperatorEmail(userEmail)
      .then((res: any) => {
        if (typeof res !== "string") {
          this.snackbarText = res.message;
          this.snackbar = true;
        } else {
          // show res message
          // handle error
        }
      })
      .catch((err: any) => {
        // TODO: handle error
        // this.isLoading = false;
      });
  }

  private filterUsersByLocation() {
    this.userList = this.userListTemp.filter((x) => this.selectedLocationId !== 0 ? x.branchId === this.selectedLocationId : true);
  }
}
</script>
