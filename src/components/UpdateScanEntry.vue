<template>
  <v-card>
    <v-card-title>
      <h3 class="grey--text text--darken-3">Edit Scan Entry</h3>
      <v-btn class="icon-btn close-btn" @click="$emit('onCompanyDialogClose')">
        <img src="/img/close-icon.svg" alt="Close Icon" />
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-container class="px-0">
        <v-row>
          <v-col cols="12" sm="6" class="py-0">
            <v-select
              :items="userList"
              label="User Name"
              item-value="userId"
              v-model.trim="scanEntryDetail.userId"
              required
              class="required"
              data-vv-scope="refUpdateScanEntry"
              data-vv-name="User Name"
              :error-messages="errors.collect('User Name')"
              v-validate="'required'"
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
          <v-col cols="12" sm="6" class="py-0">
            <v-select
              ref="refUpdateScanEntry"
              v-if="!isRoomAssetType(scanEntryDetail.assetDetail.assetTypeId)"
              :items="amountList"
              label="Amount(%)"
              v-model.trim="scanEntryDetail.amount"
              required
              class="required"
              data-vv-scope="refUpdateScanEntry"
              data-vv-name="Amount"
              :error-messages="errors.collect('Amount')"
              v-validate="'required'"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <DateTimePicker
              ref="refInTime"
              :dateTime.sync="getInTime"
              :isStaticLocation="false"
              placeHolderText="In Time"
              :isCurrentTime="true"
              :isValidationRequired="true"
              :showPresentTimeIcon="true"
            />
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <DateTimePicker
              ref="refOutTime"
              :dateTime.sync="getOutTime"
              :isStaticLocation="false"
              placeHolderText="Out Time"
              :isCurrentTime="true"
              :isValidationRequired="true"
              :showPresentTimeIcon="true"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="text-center pa-3">
      <v-spacer></v-spacer>
      <v-btn text class="m-auto" @click="$emit('onCompanyDialogClose')">Cancel</v-btn>
      <v-btn text class="m-auto primary" :loading="isLoading" @click="updateScanEntryRecord">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped></style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import CompanyModel from "@/models/CompanyModel";
import Shared from "../common/shared";
import CompanyController from "../api/companyController";
import UserModel from "../models/UserModel";
import moment, { Moment } from "moment";
import DateTimePicker from "@/components/DateTimePicker.vue";
import UpdateScanEntryModel from "../models/UpdateScanEntryModel";
import ScanEntryModel from "../models/ScanEntryModel";
import AssetTypeModel from "../models/AssetTypeModel";
import { AssetType } from "../common/enums";
import ScanEntryController from "../api/scanEntryController";

@Component({
  components: { DateTimePicker },
})
export default class UpdateScanEntry extends Vue {
  @Prop() private scanEntry: ScanEntryModel | null;
  @Prop() private userList: UserModel[] | null;
  @Prop() private assetTypeList: AssetTypeModel[] | null;
  @Prop() private userEmailId: string | null;
  private amountList: any[] = ["0", "25", "50", "75", "100"];
  private selectedUserId: number | null = null;
  private isLoading: boolean = false;
  private updateScanEntryDetail: UpdateScanEntryModel = new UpdateScanEntryModel();
  private updateInTime: moment.Moment | null = null;
  private updateOutTime: moment.Moment | null = null;

  private get scanEntryDetail(): ScanEntryModel | null {
    return Object.assign({}, this.scanEntry);
  }

  private created() {
    if (this.scanEntryDetail) {
      this.updateInTime = this.scanEntryDetail.inTime
        ? moment(this.scanEntryDetail.inTime)
        : null;
      this.updateOutTime = this.scanEntryDetail.outTime
        ? moment(this.scanEntryDetail.outTime)
        : null;
    }
  }

  private async validate(): Promise<boolean> {
    let result = true;
    const updateScanEntryField: boolean = await this.$validator.validateAll(
      "refUpdateScanEntry",
    );
    const inTimeResult = await (this.$refs
      .refInTime as DateTimePicker).$validator.validateAll();
    const outTimeResult = await (this.$refs
      .refOutTime as DateTimePicker).$validator.validateAll();
    // set focus to non validate field
    if (!updateScanEntryField || !inTimeResult || !outTimeResult) {
      Shared.setValidationFocus(this.$el as HTMLElement);
      result = updateScanEntryField && inTimeResult && outTimeResult;
    }
    return result;
  }

  private updateScanEntryRecord() {
    this.validate().then((result: boolean) => {
      if (result) {
        const self = this;
        self.scanEntryDetail!.inTime = this.getInTime;
        self.scanEntryDetail!.outTime = this.getOutTime;
        ScanEntryController.updateScanEntry(
          this.scanEntryDetail!,
          this.userEmailId!,
        )
          .then((res: ScanEntryModel | string) => {
            if (typeof res !== "string") {
              this.$emit("onsaveScanEntryDetails", res);
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

  private get getInTime(): moment.Moment | null {
    return this.updateInTime;
  }

  private set getInTime(newValue: moment.Moment | null) {
    this.updateInTime = newValue;
  }

  private get getOutTime(): moment.Moment | null {
    return this.updateOutTime;
  }

  private set getOutTime(newValue: moment.Moment | null) {
    this.updateOutTime = newValue;
  }

  private isRoomAssetType(assetTypeId): boolean {
    return assetTypeId === AssetType.Room;
  }

  private dateTimeFormat(): string {
    return Shared.DateTimeFormat;
  }
}
</script>
