<template>
  <div>
    <v-container fluid fill-height class="px-6">
      <v-layout>
        <v-flex xs12 class="mt-3">
          <v-fade-transition mode="out-in" v-bar>
            <v-layout>
              <v-flex xs12>
                <v-row class="mb-2">
                  <v-col cols="4" class="py-0">
                    <v-select
                      :items="userListTemp"
                      label="User Name"
                      item-value="userId"
                      v-model.trim="selectedUserId"
                    >
                      <template
                        slot="selection"
                        slot-scope="data"
                      >{{ data.item.firstName }} {{ data.item.lastName }}</template>
                      <template
                        slot="item"
                        slot-scope="data"
                      >{{ data.item.firstName }} {{ data.item.lastName }}</template>
                    </v-select>
                  </v-col>
                  <v-col cols="4" class="py-0">
                    <v-select
                      :items="locationList"
                      label="Locations"
                      item-value="branchId"
                      item-text="branchName"
                      v-model.trim="selectedLocationId"
                      hide-details
                    ></v-select>
                  </v-col>
                  <v-col cols="4" class="py-0">
                    <v-select
                      :items="assetTypeList"
                      label="Asset Type"
                      item-value="assetTypeId"
                      item-text="name"
                      v-model.trim="selectedAssetTypeId"
                    ></v-select>
                  </v-col>
                  <v-col cols="6" lg="4"  class="text-right py-0">
                    <DateTimePicker
                      ref="dateTimePickerFrom"
                      :dateTime.sync="searchFromDate"
                      :isStaticLocation="false"
                      placeHolderText="From In Time"
                      :isCurrentTime="false"
                      :isValidationRequired="false"
                      :showPresentTimeIcon="false"
                      v-model="searchFromDate"
                      :maxDate="selectableDateTime(searchToDate)"
                      :hideTimePicker="false"
                      :displayFormat="dateTimeFormat()"
                    />
                  </v-col>
                  <v-col cols="6" lg="4" class="text-right py-0">
                    <DateTimePicker
                      ref="dateTimePickerFrom"
                      :dateTime.sync="searchToDate"
                      :isStaticLocation="false"
                      placeHolderText="To Out Time"
                      :isCurrentTime="false"
                      :isValidationRequired="false"
                      :showPresentTimeIcon="false"
                      v-model="searchToDate"
                      :minDate="selectableDateTime(searchFromDate)"
                      :hideTimePicker="false"
                      :displayFormat="dateTimeFormat()"
                    />
                  </v-col>
                <v-col cols="12" lg="4" class="text-right pt-0 pb-3 d-flex justify-end align-center">
                    <v-btn text class="primary px-3" @click="searchScanEntries()">Search</v-btn>&nbsp;
                    <v-btn
                      text
                      class="primary px-3 ml-2"
                      @click="openExportToExcelDialog"
                    >Export To Excel</v-btn>
                  </v-col>
                </v-row>
                <v-data-table
                  :headers="headers"
                  :items="scanEntriesList"
                  item-key="scanEntryId"
                  class="elevation-1 grid-table"
                >
                  <template v-slot:item.userId="{ item }">{{ getUserNameById(item.userId) }}</template>
                  <template v-slot:item.branchId="{ item }">{{ getLocationName(item.branchId) }}</template>
                  <template
                    v-slot:item.assetDetail="{ item }"
                  >{{ getAssetTypeName(item.assetDetail.assetTypeId) }}</template>
                  <template v-slot:item.inTime="{ item }">{{ getFormatedDate(item.inTime) }}</template>
                  <template v-slot:item.outTime="{ item }">{{ getFormatedDate(item.outTime) }}</template>
                  <template v-slot:item.amount="{ item }">{{ item.amount == 0 ? '-' : item.amount }}</template>
                  <template
                    v-slot:item.modifiedDate="{ item }"
                  >{{ getFormatedDate(item.modifiedDate) }}</template>
                  <template v-slot:item.action="{ item }">
                    <v-btn class="icon-btn edit-btn" @click="onEditScanEntryDetails(item)">
                      <img src="/img/edit-icon.svg" alt="Edit Icon" />
                    </v-btn>
                    <v-btn class="icon-btn delete-btn" @click="deletePopup(item.scanEntryId)">
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
      v-if="showUpdateScanEntryDialog"
      v-model="showUpdateScanEntryDialog"
      max-width="800"
      content-class="form-dailog"
      persistent
    >
      <UpdateScanEntry
        :scanEntry="scanEntry"
        :userList="userList"
        :assetTypeList="assetTypeList"
        :userEmailId="userEmailId"
        v-on:onsaveScanEntryDetails="saveScanEntryDetails"
        v-on:onCompanyDialogClose="closeDialog"
      ></UpdateScanEntry>
    </v-dialog>
    <!-- export to excel dialog -->
    <v-dialog v-if="exportToExcelDialog" v-model="exportToExcelDialog" max-width="600" persistent>
      <v-card>
        <v-card-title>
          <h3 class="grey--text text--darken-3">Export To Excel</h3>
          <v-btn class="icon-btn close-btn" @click="exportToExcelDialog = false">
            <img src="/img/close-icon.svg" alt="Close Icon" />
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container class="px-0">
            <v-row>
              <v-col cols="12" sm="12" class="py-0">
                    <v-text-field label="Export Name" v-model="exportName"/>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="text-center pa-3">
          <v-spacer></v-spacer>
            <v-btn text class="m-auto" @click="exportToExcelDialog = false">Cancel</v-btn>
            <export-excel
                class="btn ml-2"
                :exportFields="exportToExcelHeaderFields"
                :fetch="exportScanEntries"
                worksheet="Scan Entries Details"    
                :before-generate="startExportGeneration"
                :before-finish="stopExportGeneration"
                type="csv"
                :name="exportName ? exportName + '.xls' : getFileName" >
                <v-btn text class="m-auto primary" ref="ExportToExcel" :loading="exportToExcelLoader" :disabled="exportToExcelLoader">
                    <v-icon class="md-icon">get_app</v-icon>
                    &nbsp; Export
                </v-btn>
            </export-excel> 
         </v-card-actions>
      </v-card>
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
import AddUpdateCompany from "@/components/AddUpdateCompany.vue";
import Shared from "../common/shared";
import CompanyController from "../api/companyController";
import { UserType } from "../common/enums";
import UpdateScanEntry from "@/components/UpdateScanEntry.vue";
import UserController from "../api/userController";
import UserModel from "../models/UserModel";
import moment from "moment";
import AssetController from "../api/assetController";
import AssetTypeModel from "../models/AssetTypeModel";
import DateTimePicker from "@/components/DateTimePicker.vue";
import ScanEntryController from "@/api/scanEntryController";
import { Moment } from "moment";
import ScanEntryModel from "../models/ScanEntryModel";
import AssetModel from "../models/AssetModel";
import excel from 'vue-excel-export';
import CompanyBranchModel from '../models/CompanyBranchModel';

@Component({
  components: { AddUpdateCompany, UpdateScanEntry, DateTimePicker, excel },
})
export default class ScanEntry extends Vue {
  private snackbarTimeout: number = Shared.SnackbarMessageTimeout;
  private snackbar: boolean = false;
  private snackbarText: string = "";
  private showUpdateScanEntryDialog: boolean = false;
  private scanEntriesList: ScanEntryModel[] = [];
  private userList: UserModel[] = [];
  private selectedUserId: number = 0;
  private assetTypeList: AssetTypeModel[] = [];
  private selectedAssetTypeId: number = 0;
  private searchFromDate: moment.Moment = moment().set({ hour: 0, minute: 0 });
  private searchToDate: moment.Moment = moment().set({ hour: 23, minute: 59 });
  private scanEntry: ScanEntryModel = new ScanEntryModel();
  private exportToExcelDialog: boolean = false;
  private exportToExcelHeaderFields: any = {
    'User Name': 'userName',
    'Asset Type': 'assetTypeName',
    'In Time': 'inTime',
    'Out Time': 'outTime',
    'Amount': 'amount',
    'Last Modefied At': 'modefiedAt',
  };
  private exportName: string = "";
  private exportToExcelLoader: boolean = false;
  private userEmailId: string | null = localStorage.getItem(Shared.lsUserEmailId);
  private filteredUserId: number = 0;
  private selectedLocationId: number = 0;
  private locationList: CompanyBranchModel[] = [];
  private userListTemp: UserModel[] = [];

  private headers: any = [
    { text: "User Name", value: "userId" },
    { text: "Branch Name", value: "branchId" },
    { text: "Asset Type", value: "assetDetail" },
    { text: "In Time", value: "inTime", align: "center" },
    { text: "Out Time", value: "outTime", align: "center" },
    { text: "Amount(%)", value: "amount", align: "center" },
    { text: "Last modified At", value: "modifiedDate", align: "center" },
    { text: "", value: "action", align: "end", sortable: false },
  ];

  private created() {
    this.setDefaultFilter();
    if (this.userEmailId) {
      this.getScanEntries(this.filteredUserId, this.searchFromDate, this.searchToDate);
      this.getUsers(this.userEmailId);
      this.getLocationList(this.userEmailId);
    } else {
      this.$router.push("/login");
    }
    this.getAssetType();
    Vue.use(excel);
  }

  private setDefaultFilter() {
    this.searchFromDate = moment().set({ hour: 0, minute: 0 });
    this.searchToDate = moment().set({ hour: 23, minute: 59 });
  }

  private getUsers(userEmailId: string) {
    UserController.getUsers(userEmailId).then((res: UserModel[] | string) => {
       if (typeof res !== "string") {
         this.userList = res;
         this.userListTemp = JSON.parse(JSON.stringify(res));
         if (res.length > 1) {
            this.userListTemp.unshift(
              Object.assign(new UserModel(), {
                userId: 0,
                firstName: 'All',
              }),
            );
          } else if (res.length === 1) {
            this.selectedUserId = this.userList[0].userId;
          }
      } else {
        // handle error
      }
    });
  }

  private onEditScanEntryDetails(scanEntry: ScanEntryModel) {
    this.scanEntry = scanEntry;
    this.showUpdateScanEntryDialog = true;
  }

  private closeDialog() {
    this.showUpdateScanEntryDialog = false;
    this.scanEntry = new ScanEntryModel();
  }

  private deletePopup(scanEntryId: number) {
    Shared.confirmationPopup.open(
      "Are you sure you want to delete?",
      "",
      "",
      "",
      "",
      this,
      "deleteScanEntry",
      scanEntryId,
    );
  }

  private deleteScanEntry(scanEntryId: number) {
    // To Do change api
    CompanyController.deleteCompany(scanEntryId)
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

  private saveScanEntryDetails(scanEntryDetail: ScanEntryModel) {
    this.showUpdateScanEntryDialog = false;
    this.snackbarText = "Scan Entry Detail Saved Successfully.";
    this.snackbar = true;
    const index: number = this.scanEntriesList.findIndex(
      (c: ScanEntryModel) => c.scanEntryId === scanEntryDetail.scanEntryId,
    );
    if (index !== -1) {
      this.scanEntriesList.splice(index, 1, scanEntryDetail);
    } else {
      this.scanEntriesList.push(scanEntryDetail);
    }
  }

  private formateDate(date: string) {
    return moment(String(date)).format("MM/DD/YYYY hh:mm");
  }

  private getScanEntries(
    filteredUserId: number,
    searchFromDate: Moment,
    searchToDate: Moment,
  ) {
    // this function is used for to iso string convert
    // const dateOne = moment(searchFromDate).toISOString();
    const fromDate = ""; // moment(searchFromDate).toString();
    const toDate = ""; // moment(searchToDate).toString();
    // const dateOne =  moment(searchFromDate).toDate();
    // const dateTwo = moment(searchToDate).toDate();
    ScanEntryController.getScanEntries(
      this.userEmailId!,
      this.selectedLocationId,
      this.selectedUserId,
      this.selectedAssetTypeId,
      searchFromDate.toJSON(),
      searchToDate.toJSON(),
    ).then((res: any[] | string) => {
      if (typeof res !== "string") {
        this.scanEntriesList = res;
      } else {
        // handle error
      }
    });
  }

  private getFormatedDate(createdAt: moment.Moment): string {
    if (createdAt) {
      return Shared.getFormatedDate(moment(createdAt), Shared.DateTimeFormat);
    }
    return "-";
  }

  private getAssetType() {
    AssetController.getAssetType().then((res: AssetTypeModel[]) => {
      if (typeof res !== "string") {
          this.assetTypeList = res;
          if (res.length > 1) {
            this.assetTypeList.unshift(
              Object.assign(new AssetTypeModel(), {
                assetTypeId: 0,
                name: 'All',
              }),
            );
          } else if (res.length === 1) {
            this.selectedAssetTypeId = this.assetTypeList[0].assetTypeId;
          }
      } else {
        // handle error
      }
    });
  }

  private selectableDateTime(date: moment.Moment | null): string {
    if (date) {
      return moment(date).format(DateTimePicker.DATE_FORMAT);
    }
    return "";
  }

  private dateTimeFormat(): string {
    return Shared.DateTimeFormat;
  }

  private getAssetTypeName(assetTypeId: number) {
    if (this.assetTypeList.length > 0) {
      return this.assetTypeList
        .filter((x) => x.assetTypeId === assetTypeId)
        .map((y) => y.name)[0];
    }
  }

  private getUserNameById(userId: number) {
    if (this.userList.length > 0) {
      return this.userList
        .filter((x) => x.userId === userId)
        .map((y) => y.firstName + " " + y.lastName)[0];
    }
  }

  private searchScanEntries() {
    this.getScanEntries(this.filteredUserId, this.searchFromDate, this.searchToDate);
  }

  private openExportToExcelDialog() {
    this.exportName = "";
    this.exportToExcelDialog = true;
  }

  private startExportGeneration() {
    this.exportToExcelLoader = true;
  }

  private stopExportGeneration() {
    this.exportToExcelLoader = false;
  }

  private async exportScanEntries() {
    if (this.scanEntriesList && this.scanEntriesList.length > 0) {
      let excelData: any = {};
      const exportToExcelData: any = [];
      this.scanEntriesList.forEach((element) => {
        excelData = {
          userName: this.getUserNameById(element.userId),
          assetTypeName: this.getAssetTypeName(element.assetDetail.assetTypeId),
          inTime: this.getFormatedDate(element.inTime!),
          outTime: this.getFormatedDate(element.outTime!),
          amount: element.amount.toString() === "0" ? "-" : element.amount.toString(),
          modefiedAt: this.getFormatedDate(element.modifiedDate!),
        };
        exportToExcelData.push(excelData);
      });
      this.exportToExcelDialog = false;
      this.snackbarText = 'Data Exported Successfully.';
      this.snackbar = true;
      return exportToExcelData;
    } else {
      const exportToExcelData = [];
      this.snackbarText = 'No Data Available.';
      this.snackbar = true;
      this.stopExportGeneration();
      return exportToExcelData;
    }
  }

  private get getFileName() {
    return 'DisinPro_ScanEntries (' + Shared.getFormatedDate(this.searchFromDate, Shared.DateTimeFormat)
        + ' - ' + Shared.getFormatedDate(this.searchToDate, Shared.DateTimeFormat) + ').xls';
  }

  private getLocationList(userEmailId: string) {
    CompanyController.getBranches(userEmailId).then(
      (res: CompanyBranchModel[] | string) => {
        if (typeof res !== "string") {
          this.locationList = JSON.parse(JSON.stringify(res));
          if (res.length > 1) {
            this.locationList.unshift(
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

  private getLocationName(branchId: number): string | undefined {
    if (this.locationList.length > 0) {
      return this.locationList
        .find((x) => x.branchId === branchId)!.branchName;
    }
  }
}
</script>
