<template>
  <v-card>
    <v-card-title>
      <h3 class="grey--text text--darken-3">
        {{ userDetail && userDetail.userId ? "Edit" : "Add" }} User Details
      </h3>
      <v-btn class="icon-btn close-btn" @click="$emit('onUserDialogClose')">
        <img src="/img/close-icon.svg" alt="Close Icon" />
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-container class="px-0">
        <v-row>
          <v-col cols="12" sm="6" class="py-0">
            <v-select
              :items="locationList"
              label="Location Name"
              item-value="branchId"
              item-text="branchName"
              v-model.trim="userDetail.branchId"
              required
              class="required"
              data-vv-scope="refUser"
              data-vv-name="Location Name"
              :error-messages="errors.collect('Location Name')"
              v-validate="'required'"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-select
              :items="userTypeListItem"
              label="User Type"
              item-value="userTypeId"
              item-text="type"
              v-model.trim="selectedUserType"
              required
              class="required"
              data-vv-scope="refUser"
              data-vv-name="User Type"
              :error-messages="errors.collect('User Type')"
              v-validate="'required'"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="First Name"
              v-model="userDetail.firstName"
              class="required"
              required
              data-vv-scope="refUser"
              data-vv-name="FirstName Name"
              :error-messages="errors.collect('FirstName Name')"
              v-validate="'required'"
            />
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="Last Name"
              v-model="userDetail.lastName"
              class="required"
              required
              data-vv-scope="refUser"
              data-vv-name="LastName Name"
              :error-messages="errors.collect('LastName Name')"
              v-validate="'required'"
            />
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="Email"
              v-model="userDetail.email"
              class="required"
              required
              data-vv-scope="refUser"
              data-vv-name="Email"
              :error-messages="errors.collect('Email')"
              v-validate="'required|email'"
              :disabled="userDetail && userDetail.userId ? true : false"
            />
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <!-- checkbox for user is active-->
            <v-checkbox
              label="Is Active"
              class="mt-3"
              hide-details
              color="primary"
              v-model="userDetail.isActive"
            ></v-checkbox>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="text-center pa-3">
      <v-spacer></v-spacer>
      <v-btn text class="m-auto" @click="$emit('onUserDialogClose')">Cancel</v-btn>
      <v-btn text class="m-auto primary" :loading="isLoading" @click="addOrEditUserDetail">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped></style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import UserModel from "@/models/UserModel";
import Shared from "../common/shared";
import UserController from "../api/userController";
import UserTypeModel from "../models/UserTypeModel";
import CompanyBranchModel from '../models/CompanyBranchModel';

@Component
export default class AddUpdateUser extends Vue {
  @Prop() private user: UserModel | null;
  @Prop() private userTypeList: UserTypeModel[] | null;
  @Prop() private locationList: CompanyBranchModel[] | null;
  private isLoading: boolean = false;
  private selectedUserType: number | null = null;

  private mounted() {
    this.selectedUserType = this.userDetail && this.userDetail.userType ? this.userDetail.userType.userTypeId : null;
  }

  private get userDetail(): UserModel | null {
    const tempUser: UserModel = Object.assign({}, this.user);
    if (tempUser && tempUser.userId) {
      return tempUser;
    } else {
      tempUser.isActive = true;
      return tempUser;
    }
  }

  private get userTypeListItem(): UserTypeModel[] | null {
    return this.userTypeList;
  }

  private async validate(): Promise<boolean> {
    const result: boolean = await this.$validator.validateAll("refUser");
    // set focus to non validate field
    if (!result) {
      Shared.setValidationFocus(this.$el as HTMLElement);
    }
    return result;
  }

  private addOrEditUserDetail() {
    const userEmail: string | null = localStorage.getItem(Shared.lsUserEmailId);
    if (!userEmail) {
      this.$router.push("/login");
    }
    this.validate().then((result: boolean) => {
      if (result && this.userDetail && userEmail) {
        this.isLoading = true;
        // TODO start: make it dynamic
        const userType = new UserTypeModel();
        userType.userTypeId = this.selectedUserType ? this.selectedUserType : 0;
        userType.type = this.userTypeList ? this.userTypeList.filter((x) => x.userTypeId === this.selectedUserType).map((y) => y.type)[0] : '';
        this.userDetail.userType = userType;
        // TODO end: make it dynamic
        UserController.addUpdateUser(this.userDetail, userEmail)
          .then((res: UserModel | string) => {
            if (typeof res !== "string") {
              this.$emit("onSaveUserDetail", res);
            } else {
              // show res message
              // handle error
            }
          })
          .catch((err: any) => {
            // TODO: handle error
            this.isLoading = false;
          });
      }
    });
  }
}
</script>
