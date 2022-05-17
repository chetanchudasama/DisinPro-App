<template>
  <v-container fluid class="px-6">
    <v-layout wrap>
      <v-flex class="btn-wrap text-right d-flex mt-3 mb-1">
        <v-col class="pa-0">
          <v-btn text class="m-auto mx-0 primary" @click="showAddAssetDialog = true">Add Asset</v-btn>
        </v-col>
        <UploadExcel :branchList="branchList" v-on:saveExcelDataToJson="onSaveExcelDataToJson" :selectedLocationId="selectedLocationId"></UploadExcel>
      </v-flex>
       <v-flex xs12 class="align-center px-3 border-block my-4">
        <v-row class="align-center">
          <v-col cols="3">
            <v-select
              :items="numberOfQRCodeInPage"
              label="Print barcode per page"
              dense
              v-model.trim="selectedNumberOfQRCodeInPage"
              class="pt-1"
              hide-details          
            ></v-select>
          </v-col>
          <v-col cols="3">
             <v-select
              :items="filterBranchList"
              item-text="branchName"
              item-value="branchId"
              label="Locations"
              dense
              v-model.trim="selectedLocationId"
              @change="filterAssetsByLocation"
              class="pt-1"
              hide-details          
           ></v-select>
          </v-col>
          <v-col cols="6" class="mt-0 text-right">
            <v-btn
              v-if="selectedAssests.length > 0"
              text
              class="primary"
              @click="downloadQRCode"
            >{{ isDownloading ? 'Generating' : 'Generate'}} PDF</v-btn>
            <v-btn
              v-if="selectedAssests.length > 0"
              text
              class="m-auto ml-2 primary"
              @click="deleteRecordToTable"
            >Delete Record</v-btn>
          </v-col>
        </v-row>
       </v-flex>
         <v-flex xs12>
        <v-data-table
          ref="assetsData"
          v-model="selectedAssests"
          :headers="headers"
          :items="assetsList"
          item-key="assetId"
          show-select
          class="elevation-1"
          :loading="isLoading"
          :options.sync="pagination"
          name="assetsTable"
          :footer-props="{
            'items-per-page-options': [10, 20, 30, -1]
          }"
        >
          <template v-slot:item.branchId="{ item }">{{ getLocationName(item.branchId) }}</template>
          <template v-slot:item.assetTypeId="{ item }">{{ getAssetTypeName(item.assetTypeId) }}</template>
          <template v-slot:item.name="{ item }">{{ item.name }}</template>
          <template v-slot:item.misc="{ item }">{{ item.misc }}</template>
          <template v-slot:item.size="{ item }">{{ item.size }}</template>
        </v-data-table>
        <canvas id="mycanvas" style="position:absolute;visibility: hidden;"></canvas>
      </v-flex>
    </v-layout>
    <v-dialog
      v-model="showAddAssetDialog"
      v-if="showAddAssetDialog"
      max-width="800"
      content-class="form-dailog"
      persistent
    >
      <AddAsset
        :branchList="branchList"
        :userEmailId="userEmailId"
        :assetTypeList="assetTypeList"
        v-on:onSaveAssetDetail="saveAssetDetail"
        v-on:onAddAssetDialogClose="showAddAssetDialog = false"
      ></AddAsset>
    </v-dialog>
    <v-snackbar :timeout="snackbarTimeout" v-model="snackbar" left bottom class="snack-bar">
      {{ snackbarText }}
      <v-btn dark text @click.native="snackbar = false" color="secondary" class="icon-btn">
        <img src="/img/close-icon-white.svg" alt="close icon" />
      </v-btn>
    </v-snackbar>
  </v-container>
</template>


<style scoped>
.border-block {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 5px;
}
</style>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";
import UploadExcel from "@/components/UploadExcel.vue";
import jsPDF from "jspdf";
import bwipjs from "bwip-js";
import Shared from "../common/shared";
import AssetModel from "@/models/AssetModel";
import CompanyController from "../api/companyController";
import AssetController from "../api/assetController";
import AddAsset from "@/components/AddAsset.vue";
import CompanyBranchModel from "../models/CompanyBranchModel";
import { UserType, AssetType } from "../common/enums";
import AddAssetModel from "../models/AddAssetModel";
import AssetTypeModel from '../models/AssetTypeModel';

@Component({
  components: { UploadExcel, AddAsset },
})
export default class Assets extends Vue {
  private localTableData: AssetModel[] = [];
  private localTableHeader: any = [];
  private headers: any = [];
  private assetsList: any[] = [];
  private assetsListTemp: any[] = [];
  private isLoading: boolean = false;
  private pagination: any = {};
  private selectedAssests: any = [];
  private printList: any = [];
  private numberOfQRCodeInPage = [10, 30];
  private selectedNumberOfQRCodeInPage = 10;
  private isDownloading: boolean = false;
  private showAddAssetDialog: boolean = false;
  private branchList: CompanyBranchModel[] = [];
  private filterBranchList: CompanyBranchModel[] = [];
  private userEmailId: string | null = "";
  private assetTypeList: AssetTypeModel[] = [];
  private snackbarTimeout: number = Shared.SnackbarMessageTimeout;
  private snackbar: boolean = false;
  private snackbarText: string = "";
  private selectedLocationId: number = 0;

  private async created() {
    const userEmailId: string | null = localStorage.getItem(
      Shared.lsUserEmailId,
    );
    if (userEmailId) {
      this.getAssets(userEmailId);
    } else {
      this.$router.push("/login");
    }
    this.headers = [
      {
        text: "Location",
        value: "branchId",
        align: "right",
      },
      {
        text: "Name",
        value: "name",
        align: "right",
      },
      {
        text: "Type",
        value: "assetTypeId",
        align: "right",
      },
      {
        text: "Misc",
        value: "misc",
        align: "right",
      },
      {
        text: "Size",
        value: "size",
        align: "center",
      },
    ];
    this.userEmailId = localStorage.getItem(Shared.lsUserEmailId);
    if (this.userEmailId) {
      this.getBranches(this.userEmailId);
    }
    this.getAssetType();
  }

  private onSaveExcelDataToJson(
    tableData: any[],
    tableHeader: any[],
    selectedBranchId: number,
  ) {
    const self = this;
    if (tableData.length > 0) {
      tableData.forEach((item, index) => {
        const asset: AssetModel = new AssetModel();
        asset.assetTypeId = item.assetType
          ? item.assetType.toLowerCase() ===
            AssetType[AssetType.Room].toLowerCase()
            ? 1
            : 2
          : 0;
        asset.name = item.name;
        asset.misc = item.misc;
        asset.size = item.size;
        this.localTableData.push(asset);
      });
      const addAsset = new AddAssetModel();
      addAsset.branchId = selectedBranchId;
      addAsset.actionUserEmail = self.userEmailId ? self.userEmailId : "";
      addAsset.assets = [...this.localTableData];
      this.saveAssetDetail(addAsset);
    }
  }

  private saveAssetDetail(addAssetDetail: AddAssetModel) {
    const self = this;
    AssetController.addListOFAssets(addAssetDetail)
      .then((res: any) => {
        if (typeof res !== "string" && res.status && res.data.length > 0) {
          self.assetsList.push(...res.data);
          self.assetsListTemp.push(...res.data);
          if (res.message) {
            self.snackbarText = res.message;
            self.snackbar = true;
          } else {
            self.snackbarText = "Added Asset record successfully";
            self.snackbar = true;
          }
          self.showAddAssetDialog = false;
        } else {
          self.snackbarText = res.message;
          self.snackbar = true;
          self.showAddAssetDialog = false;
        }
      })
      .catch((err: any) => {
        this.isLoading = false;
        // TODO: handle error
      });
  }

  private downloadQRCode() {
    this.isDownloading = true;
    setTimeout(() => {
      if (this.selectedAssests.length <= 0) {
        return;
      }
      let dataURL = "";
      let top = 0;
      let left = 0;
      let qrcodeWidth = 0;
      let qrcodeHeight = 0;
      let currentIndex = 0;
      let fontSize = 0;
      switch (this.selectedNumberOfQRCodeInPage) {
        case 10:
          qrcodeWidth = 260;
          qrcodeHeight = 145;
          fontSize = 5;
          break;
        case 30:
          qrcodeWidth = 165;
          qrcodeHeight = 65;
          fontSize = 7;
          break;
        default:
          break;
      }
      this.printList = this.selectedAssests;
      const self = this;
      if (self.printList.length > 0) {
        const barCodeStringList = self.printList.filter(
          (x) => x.barCodeString === null,
        );
        if (barCodeStringList.length > 0) {
          self.snackbarText = "Something went wrong";
          self.snackbar = true;
          return;
        }
      }
      const doc = new jsPDF("", "pt", "a4"); // Initialize pdf
      const desc = "Tatvasoft";
      // set font size
      doc.setFontSize(18);
      // start the qrcode generate
      for (let i = 0; i < this.printList.length; i++) {
        if (i % this.selectedNumberOfQRCodeInPage === 0) {
          currentIndex = 0;
        }
        try {
          // The return value is the canvas element
          const qrcode = bwipjs.toCanvas("mycanvas", {
            bcid: "code128", // Barcode type
            text: this.printList[i].barcodeString, // Text to encode
            scale: 3, // 3x scaling factor
            height: 10, // Bar height, in millimeters
            includetext: true, // Show human-readable text
            textxalign: "center", // Always good to set this
            padding: 5,
            textsize:  fontSize,
            alttext: this.printList[i].name + ' ' + this.getAssetTypeName(this.printList[i].assetTypeId),
          });
          const canvas = document.getElementById(
            "mycanvas",
          ) as HTMLCanvasElement; // Get the canvas element
          dataURL = canvas!.toDataURL();
        } catch (e) {
          // `e` may be a string or Error object
        }
        const totalPages = Math.ceil(
          this.selectedAssests.length / this.selectedNumberOfQRCodeInPage,
        );
        if (i !== 0 && i % this.selectedNumberOfQRCodeInPage === 0) {
          doc.addPage();
        }

        if (this.selectedNumberOfQRCodeInPage === 10) {
          if (currentIndex % 2 === 0) {
            top = 40 + currentIndex * 80;
            left = 18;
          } else {
            left = 320;
          }
        } else {
          if (currentIndex % 3 === 0) {
            top = 40 + (currentIndex / 3) * 80;
            left = 18;
          } else {
            left += 198;
          }
        }
        currentIndex++;
        doc.addImage(dataURL, "JPEG", left, top, qrcodeWidth, qrcodeHeight); // pdf to add image
      }
      doc.save("QRcode.pdf"); // Download pdf, the file name is QRcode.pdf
      this.isDownloading = false;
    }, 0);
  }

  private deleteRecordToTable() {
    const self = this;
    const deletedItem: any[] = self.selectedAssests.map((x: any) => x.assetId);
    AssetController.deleteAssetsDetail(deletedItem).then((res: any) => {
      if (res && res.data.length > 0) {
         res.data.forEach((assetId: number) => {
           const index = self.assetsList.findIndex((x) => x.assetId === assetId);
           self.assetsList.splice(index, 1);
           self.assetsListTemp.splice(index, 1);
         });
         self.selectedAssests = [];
         this.snackbarText = res.message;
         this.snackbar = true;
      } else {
        // to do handle error
         this.snackbarText = res.message;
         this.snackbar = true;
      }
    });
  }

  private async validate(): Promise<boolean> {
    const result: boolean = await this.$validator.validateAll("refAddAsset");
    // set focus to non validate field
    if (!result) {
      Shared.setValidationFocus(this.$el as HTMLElement);
    }
    return result;
  }

  private getAssets(userEmailId: string) {
    AssetController.getAssets(userEmailId).then((res: AssetModel[]) => {
      if (res) {
        this.assetsList = JSON.parse(JSON.stringify(res));
        this.assetsListTemp = JSON.parse(JSON.stringify(res));
      }
    });
  }

  private getBranches(userEmailId: string) {
    CompanyController.getBranches(userEmailId).then(
      (res: CompanyBranchModel[] | string) => {
        if (typeof res !== "string") {
          this.branchList = res;
          this.filterBranchList =  JSON.parse(JSON.stringify(res));
          if (res.length > 1) {
            this.filterBranchList.unshift(
              Object.assign(new CompanyBranchModel(), {
                branchId: 0,
                branchName: 'All',
              }),
            );
          } else {
            this.selectedLocationId = res[0].branchId;
          }
        } else {
          // handle error
        }
      },
    );
  }

  private getAssetType() {
    AssetController.getAssetType().then((res: AssetTypeModel[]) => {
      if (res) {
        this.assetTypeList = res;
      }
    });
  }

  private getAssetTypeName(assetTypeId: number): string | undefined {
    if (this.assetTypeList.length > 0) {
      return this.assetTypeList
        .find((x) => x.assetTypeId === assetTypeId)!.name;
    }
  }

  private getLocationName(branchId: number): string | undefined {
    if (this.branchList.length > 0) {
      return this.branchList
        .find((x) => x.branchId === branchId)!.branchName;
    }
  }

  private filterAssetsByLocation() {
    this.assetsList = this.assetsListTemp.filter((x) => this.selectedLocationId !== 0 ? x.branchId === this.selectedLocationId : true);
  }
}
</script>
