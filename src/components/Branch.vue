<template>
  <div>
    <v-container fluid fill-height class="px-6">
      <v-layout>
        <v-flex xs12>
          <v-fade-transition mode="out-in" v-bar>
            <v-layout>
              <v-flex xs12>
                <div class="btn-wrap my-4 text-right">
                  <v-btn min-width="150" class="primary" @click="showBranchDialog = true">Add Location</v-btn>
                </div>
                <v-data-table
                  :headers="headers"
                  :items="branchList"
                  item-key="branchId"
                  class="elevation-1 grid-table"
                >
                  <template v-slot:item.action="{ item }">
                    <v-btn class="icon-btn edit-btn" @click="onEditBranchDetails(item)">
                      <img src="/img/edit-icon.svg" alt="Edit Icon" />
                    </v-btn>
                    <v-btn class="icon-btn delete-btn" @click="deletePopup(item.branchId)">
                      <img src="/img/delete-icon.svg" alt="Delete Icon" />
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
      v-if="showBranchDialog"
      v-model="showBranchDialog"
      max-width="800"
      content-class="form-dailog"
      persistent
    >
      <AddUpdateBranch
        :branch="branch"
        v-on:onSaveBranchDetail="saveBranchDetail"
        v-on:onBranchDialogClose="closeDialog"
      ></AddUpdateBranch>
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
</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CompanyBranchModel from "@/models/CompanyBranchModel";
import AddUpdateBranch from "@/components/AddUpdateBranch.vue";
import Shared from "../common/shared";
import CompanyController from "../api/companyController";
import { UserType } from "../common/enums";

@Component({
  components: { AddUpdateBranch },
})
export default class Branch extends Vue {
  private branch: CompanyBranchModel = new CompanyBranchModel();
  private snackbarTimeout: number = Shared.SnackbarMessageTimeout;
  private snackbar: boolean = false;
  private snackbarText: string = "";
  private showBranchDialog: boolean = false;
  private branchList: CompanyBranchModel[] = [];

  private headers: any = [
    { text: "Location Name", value: "branchName" },
    { text: "Address", value: "address" },
    { text: "City", value: "city" },
    { text: "State", value: "state" },
    { text: "Office Number", value: "phoneNumber" },
    { text: "Mobile Number", value: "optionalNumber" },
    { text: "", value: "action", align: "end", sortable: false },
  ];

  private created() {
    const userEmailId: string | null = localStorage.getItem(
      Shared.lsUserEmailId,
    );
    const userType: string | null = localStorage.getItem(Shared.lsUserType);
    if (userEmailId && userType === UserType[UserType.CompanyAdmin]) {
      this.getBranches(userEmailId);
    } else {
      this.$router.push("/login");
    }
  }

  private getBranches(userEmailId: string) {
    CompanyController.getBranches(userEmailId).then(
      (res: CompanyBranchModel[] | string) => {
        if (typeof res !== "string") {
          this.branchList = res;
          // manage response
        } else {
          // handle error
        }
      },
    );
  }

  private onEditBranchDetails(branch: CompanyBranchModel) {
    this.branch = branch;
    this.showBranchDialog = true;
  }

  private closeDialog() {
    this.showBranchDialog = false;
    this.branch = new CompanyBranchModel();
  }

  private deletePopup(branchId: number) {
    Shared.confirmationPopup.open(
      "Are you sure you want to delete?",
      "",
      "",
      "",
      "",
      this,
      "deleteBranch",
      branchId,
    );
  }

  private deleteCompany(branchId: number) {
    CompanyController.deleteBranch(branchId)
      .then((res: any) => {
        if (typeof res !== "string") {
          this.$emit("onSaveBranchDetail", res);
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

  private saveBranchDetail(branchDetail: CompanyBranchModel) {
    this.showBranchDialog = false;
    this.snackbarText = "Location Detail Saved Successfully.";
    this.snackbar = true;
    const index: number = this.branchList.findIndex(
      (c: CompanyBranchModel) => c.branchId === branchDetail.branchId,
    );
    if (index !== -1) {
     this.branchList.splice(index, 1, branchDetail);
    } else {
      this.branchList.push(branchDetail);
    }
  }
}
</script>
