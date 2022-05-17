<template>
  <div>
    <v-container fluid fill-height class="px-6">
      <v-layout>
        <v-flex xs12>
          <v-fade-transition mode="out-in" v-bar>
            <v-layout>
              <v-flex xs12>
                <div class="btn-wrap my-4 text-right">
                  <v-btn
                    min-width="150"
                    class="primary"
                    @click="showCompanyDialog = true"
                  >Add Company</v-btn>
                </div>
                <v-data-table
                  :headers="headers"
                  :items="companiesList"
                  item-key="companyId"
                  class="elevation-1 grid-table"
                >
                  <template v-slot:item.action="{ item }">
                    <v-btn class="icon-btn edit-btn" @click="onEditCompanyDetails(item)">
                      <img src="/img/edit-icon.svg" alt="Edit Icon" />
                    </v-btn>
                    <v-btn class="icon-btn delete-btn" @click="deletePopup(item.companyId)">
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
      v-if="showCompanyDialog"
      v-model="showCompanyDialog"
      max-width="800"
      content-class="form-dailog"
      persistent
    >
      <AddUpdateCompany
        :company="company"
        v-on:onSaveCompanyDetail="saveCompanyDetail"
        v-on:onCompanyDialogClose="closeDialog"
      ></AddUpdateCompany>
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
import CompanyModel from "@/models/CompanyModel";
import AddUpdateCompany from "@/components/AddUpdateCompany.vue";
import Shared from "../common/shared";
import CompanyController from "../api/companyController";
import { UserType } from "../common/enums";

@Component({
  components: { AddUpdateCompany },
})
export default class Company extends Vue {
  private company: CompanyModel = new CompanyModel();
  private snackbarTimeout: number = Shared.SnackbarMessageTimeout;
  private snackbar: boolean = false;
  private snackbarText: string = "";
  private showCompanyDialog: boolean = false;
  private companiesList: CompanyModel[] = [];

  private headers: any = [
    { text: "Company Name", value: "companyName" },
    { text: "Address", value: "address" },
    { text: "City", value: "city" },
    { text: "State", value: "state" },
    { text: "Phone Number", value: "phoneNumber" },
    { text: "Optional Number", value: "optionalNumber" },
    { text: "", value: "action", align: "end", sortable: false },
  ];

  private created() {
    const userEmailId: string | null = localStorage.getItem(
      Shared.lsUserEmailId,
    );
    if (userEmailId) {
      this.getCompanies(userEmailId);
    } else {
      this.$router.push("/login");
    }
  }

  private getCompanies(userEmailId: string) {
    CompanyController.getCompanies(userEmailId).then(
      (res: CompanyModel[] | string) => {
        if (typeof res !== "string") {
          this.companiesList = res;
          // manage response
        } else {
          // handle error
        }
      },
    );
  }

  private onEditCompanyDetails(company: CompanyModel) {
    this.company = company;
    this.showCompanyDialog = true;
  }

  private closeDialog() {
    this.showCompanyDialog = false;
    this.company = new CompanyModel();
  }

  private deletePopup(companyId: number) {
    Shared.confirmationPopup.open(
      "Are you sure you want to delete?",
      "",
      "",
      "",
      "",
      this,
      "deleteCompany",
      companyId,
    );
  }

  private deleteCompany(companyId: number) {
    CompanyController.deleteCompany(companyId)
      .then((res: any) => {
        if (typeof res !== "string") {
          this.$emit("onSaveCompanyDetail", res);
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

  private saveCompanyDetail(companyDetail: CompanyModel) {
    this.showCompanyDialog = false;
    this.snackbarText = "Company Detail Saved Successfully.";
    this.snackbar = true;
    const index: number = this.companiesList.findIndex(
      (c: CompanyModel) => c.companyId === companyDetail.companyId,
    );
    if (index !== -1) {
      // remove line if api is working
      this.companiesList[index].companyName = companyDetail.companyName;
      this.companiesList[index].address = companyDetail.address;
      this.companiesList[index].city = companyDetail.city;
      this.companiesList[index].state = companyDetail.state;
      this.companiesList[index].phoneNumber = companyDetail.phoneNumber;
      this.companiesList[index].phoneNumber = companyDetail.phoneNumber;
      this.companiesList[index].optionalNumber = companyDetail.optionalNumber;
    } else {
      // remove line if api calling is working
      // companyDetail.companyId = this.companiesList.length + 1;
      this.companiesList.push(companyDetail);
    }
    // this.company = new CompanyModel();
  }
}
</script>
