<template>
  <div>
    <input
      ref="excelUploadInput"
      class="excel-upload-input"
      type="file"
      accept=".xlsx, .xls"
      @change="handleClick"
    />
    <v-btn
      color="primary"
      :loading="loading"
      style="margin-left:16px;"
      size="mini"
      type="primary"
      class="ml-2"
      @click="checkBranchAndShowBranchSelection()"
    >Bulk Upload</v-btn>
    <div></div>
    <v-dialog
      v-if="showSelectBranchDialog"
      v-model="showSelectBranchDialog"
      max-width="600"
      content-class="form-dailog"
      persistent
      ref="assetDialog"
    >
      <v-card>
        <v-card-title>
          <h3 class="grey--text text--darken-3">Select Location Name</h3>
          <v-btn class="icon-btn close-btn" @click="showSelectBranchDialog = false;selectedBranchId = null">
            <img src="/img/close-icon.svg" alt="Close Icon" />
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container class="px-0">
            <v-row>
              <v-col cols="12" sm="12" class="py-0">
                <v-select
                  :items="branchList"
                  label="Location Name"
                  item-value="branchId"
                  item-text="branchName"
                  v-model.trim="selectedBranchId"
                  required
                  class="required"
                  data-vv-scope="refselectBranch"
                  data-vv-name="Location Name"
                  :error-messages="errors.collect('Location Name')"
                  v-validate="'required'"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="text-center pa-3">
          <a class="m-auto" href="Javascript:void(0)" @click="openSampleBulkUpload()">Download Sample</a>
          <v-spacer></v-spacer>
          <v-btn text class="m-auto" @click="showSelectBranchDialog = false; selectedBranchId = null">Cancel</v-btn>
          <v-btn text class="m-auto primary" @click="saveSelectBranch()">Bulk Upload</v-btn>
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
.excel-upload-input {
  display: none;
  z-index: -9999;
}
</style>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import XLSX from "xlsx";
import Shared from "../common/shared";
import CompanyController from "../api/companyController";
import CompanyBranchModel from "../models/CompanyBranchModel";

@Component
export default class UploadExcel extends Vue {
  @Prop() private branchList: CompanyBranchModel[] | null;
  @Prop() private selectedLocationId: number;
  private loading: boolean = false;
  private excelData = { header: null, results: null };
  private showSelectBranchDialog: boolean = false;
  private selectedBranchId: number | null = null;
  private snackbarTimeout: number = Shared.SnackbarMessageTimeout;
  private snackbar: boolean = false;
  private snackbarText: string = "";

  @Watch("selectedLocationId")
  private updateSelectedBranchId() {
    this.selectedBranchId = this.selectedLocationId === 0 ? null : this.selectedLocationId;
  }

  private generateData({ header, results }: any) {
    this.excelData.header = header;
    this.excelData.results = results;
    this.onSuccess(this.excelData);
  }

  private handleUpload() {
    (this.$refs.excelUploadInput as any).click();
  }

  private handleClick(e: any) {
    const files = e.target.files;
    const rawFile = files[0]; // only use files[0]
    if (!rawFile) {
      return;
    }
    if (!this.isExcel(rawFile)) {
      this.snackbarText = "Only supports upload .xlsx, .xls, .csv suffix files";
      this.snackbar = true;
      return false;
    }
    this.upload(rawFile);
  }

  private upload(rawFile: any) {
    (this.$refs.excelUploadInput as any).value = null;
    if (!this.beforeUpload) {
      this.readerData(rawFile);
      return;
    }
    const before = this.beforeUpload(rawFile);
    if (before) {
      this.readerData(rawFile);
    }
  }

  private readerData(rawFile: any) {
    this.loading = true;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target!.result;
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const header = this.getHeaderRow(worksheet);
        const results = XLSX.utils.sheet_to_json(worksheet);
        this.generateData({ header, results });
        this.loading = false;
        resolve();
      };
      reader.readAsArrayBuffer(rawFile);
    });
  }

  private getHeaderRow(sheet: any) {
    const headers: string[] = [];
    try {
      const range = XLSX.utils.decode_range(sheet["!ref"]);
      let C;
      const R = range.s.r;
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) {
        /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
        /* find the cell in the first row */
        let hdr = "UNKNOWN " + C; // <-- replace with your desired default
        if (cell && cell.t) {
          hdr = XLSX.utils.format_cell(cell);
        }
        headers.push(hdr);
      }
    } catch (e) {
      this.snackbarText = "Data is empty";
      this.snackbar = true;
      return;
    }
    return headers;
  }

  private isExcel(file: any) {
    return /\.(xlsx|xls|csv)$/.test(file.name);
  }

  private beforeUpload(file: any) {
    const isNotLargeFile = file.size / 1024 / 1024 < 10;
    if (isNotLargeFile) {
      return true;
    }
    this.snackbarText = "Please do not upload files larger than 10mb in size.";
    this.snackbar = true;
    return false;
  }

  private onSuccess(excelData: any) {
    this.$emit("saveExcelDataToJson", excelData.results, excelData.header, this.selectedBranchId);
    if (excelData.results.length !== 0 && excelData.header !== undefined) {
      this.selectedBranchId = null;
      this.showSelectBranchDialog = false;
    }
  }

  private async validate(): Promise<boolean> {
    const result: boolean = await this.$validator.validateAll(
      "refselectBranch",
    );
    // set focus to non validate field
    if (!result) {
      const el = this.$refs.assetDialog as HTMLElement;
      const assetDialog = this.$refs.assetDialog as Vue;
      Shared.setValidationFocus(assetDialog.$el as HTMLElement);
    }
    return result;
  }

  private saveSelectBranch() {
    this.validate().then((result: boolean) => {
      if (result) {
        this.handleUpload();
      }
    });
  }

  private openSampleBulkUpload() {
    window.open(window.origin + '/files/asset_bulk_upload_sample.xlsx', "_blank");
  }

  private checkBranchAndShowBranchSelection() {
    if (this.branchList!.length > 1 && !this.selectedBranchId) {
      this.showSelectBranchDialog = true;
    } else {
      if (!this.selectedBranchId) {
        this.selectedBranchId = this.branchList![0].branchId;
      }
      this.handleUpload();
    }
  }
}
</script>