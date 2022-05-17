<template>
  <v-card>
    <v-card-title>
      <h3 class="grey--text text--darken-3">Add Asset Detail</h3>
      <v-btn class="icon-btn close-btn" @click="$emit('onAddAssetDialogClose')">
        <img src="/img/close-icon.svg" alt="Close Icon" />
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-container class="px-0">
        <v-row>
          <v-col cols="12" sm="6" class="py-0">
            <v-select
              :items="branchList"
              label="Location Name"
              item-value="branchId"
              item-text="branchName"
              v-model.trim="selectedBranchId"
              required
              class="required"
              data-vv-scope="refAddAsset"
              data-vv-name="Location Name"
              :error-messages="errors.collect('Location Name')"
              v-validate="'required'"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-select
              :items="assetTypeList"
              label="Asset Type"
              item-value="assetTypeId"
              item-text="name"
              v-model.trim="assetDetail.assetTypeId"
              required
              data-vv-scope="refAddAsset"
              data-vv-name="Asset Type"
              :error-messages="errors.collect('Asset Type')"
              v-validate="'required'"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="Name"
              v-model.trim="assetDetail.name"
              class="required"
              required
              data-vv-scope="refAddAsset"
              data-vv-name="Name"
              :error-messages="errors.collect('Name')"
              v-validate="'required'"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field label="Misc" v-model.trim="assetDetail.misc"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field label="Size" v-model.trim="assetDetail.size"></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="text-center pa-3">
      <v-spacer></v-spacer>
      <v-btn text class="m-auto" @click="$emit('onAddAssetDialogClose')">Cancel</v-btn>
      <v-btn text class="m-auto primary" :loading="isLoading" @click="saveAssetDetail()">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped></style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Shared from "../common/shared";
import CompanyBranchModel from "../models/CompanyBranchModel";
import AssetModel from "../models/AssetModel";
import AddAssetModel from "../models/AddAssetModel";
import AssetTypeModel from '../models/AssetTypeModel';

@Component
export default class AddAsset extends Vue {
  @Prop() private branchList: CompanyBranchModel[] | null;
  @Prop() private userEmailId: string | null;
  @Prop() private assetTypeList: AssetTypeModel[] | null;
  private selectedBranchId: number | null = null;
  private assetDetail: AssetModel = new AssetModel();
  private addAssetDetail: AddAssetModel = new AddAssetModel();
  private isLoading: boolean = false;

  private async validate(): Promise<boolean> {
    const result: boolean = await this.$validator.validateAll("refAddAsset");
    // set focus to non validate field
    if (!result) {
      Shared.setValidationFocus(this.$el as HTMLElement);
    }
    return result;
  }

  private saveAssetDetail() {
    const self = this;
    this.validate().then((result: boolean) => {
      if (result) {
        self.isLoading = true;
        self.addAssetDetail.branchId = this.selectedBranchId ? this.selectedBranchId : 0;
        self.addAssetDetail.actionUserEmail = self.userEmailId
          ? self.userEmailId
          : "";
        const assetDetailList: AssetModel[] = [];
        assetDetailList.push(self.assetDetail);
        self.addAssetDetail.assets = [...assetDetailList];
        this.$emit("onSaveAssetDetail", self.addAssetDetail);
      }
    });
  }
}
</script>
