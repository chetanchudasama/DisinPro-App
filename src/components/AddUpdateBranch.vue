<template>
  <v-card>
    <v-card-title>
      <h3 class="grey--text text--darken-3">
        {{ branchDetail && branchDetail.branchId ? "Edit" : "Add" }} Location
        Details
      </h3>
      <v-btn class="icon-btn close-btn" @click="$emit('onBranchDialogClose')">
        <img src="/img/close-icon.svg" alt="Close Icon" />
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-container class="px-0">
        <v-row>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="Location Name"
              v-model="branchDetail.branchName"
              class="required"
              required
              data-vv-scope="refBranch"
              data-vv-name="Location Name"
              :error-messages="errors.collect('Location Name')"
              v-validate="'required'"
            />
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="Address"
              v-model.trim="branchDetail.address"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="City"
              v-model.trim="branchDetail.city"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="State"
              v-model.trim="branchDetail.state"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="Office Number"
              v-model.trim="branchDetail.phoneNumber"
              data-vv-scope="refBranch"
              data-vv-name="Office Number"
              :error-messages="validationMessage('Office Number')"
              v-validate="{ regex:/^\+?[\d ]+$/ }"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="Mobile Number"
              v-model.trim="branchDetail.optionalNumber"
              data-vv-scope="refBranch"
              data-vv-name="Mobile Number"
              :error-messages="validationMessage('Mobile Number')"
              v-validate="{ regex:/^\+?[\d ]+$/ }"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="text-center pa-3">
      <v-spacer></v-spacer>
      <v-btn text class="m-auto" @click="$emit('onBranchDialogClose')"
        >Cancel</v-btn
      >
      <v-btn
        text
        class="m-auto primary"
        :loading="isLoading"
        @click="addOrEditBranchDetail()"
        >Save</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<style scoped></style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import CompanyBranchModel from "@/models/CompanyBranchModel";
import Shared from "../common/shared";
import CompanyController from "../api/companyController";

@Component
export default class AddUpdateBranch extends Vue {
  @Prop() private branch: CompanyBranchModel | null;
  private isLoading: boolean = false;

  private get branchDetail(): CompanyBranchModel | null {
    return Object.assign({}, this.branch);
  }

  private async validate(): Promise<boolean> {
    const result: boolean = await this.$validator.validateAll("refBranch");
    // set focus to non validate field
    if (!result) {
      Shared.setValidationFocus(this.$el as HTMLElement);
    }
    return result;
  }

  private addOrEditBranchDetail() {
    const userEmail: string | null = localStorage.getItem(Shared.lsUserEmailId);
    if (!userEmail) {
      this.$router.push("/login");
    }
    this.validate().then((result: boolean) => {
      if (result && this.branchDetail && userEmail) {
        this.isLoading = true;
        this.branchDetail.userEmail = userEmail;
        CompanyController.addUpdateCompanyBranch(this.branchDetail)
          .then((res: CompanyBranchModel | string) => {
            if (typeof res !== "string") {
              this.$emit("onSaveBranchDetail", res);
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

  private validationMessage(label: string) {
    let message: string = this.$validator.errors.collect(label)[0];
    const errorMessage = label.split(/(\d+)/);
    return (message === "The Office Number field format is invalid." || message === "The Mobile Number field format is invalid.")
      ? (message = "Invalid " + errorMessage)
      : message;
  }
}
</script>
