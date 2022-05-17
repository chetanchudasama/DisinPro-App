<template>
  <v-card>
    <v-card-title>
      <h3 class="grey--text text--darken-3">
        {{ companyDetail && companyDetail.companyId ? "Edit Company Details" : "Add Company" }}
      </h3>
      <v-btn class="icon-btn close-btn" @click="$emit('onCompanyDialogClose')">
        <img src="/img/close-icon.svg" alt="Close Icon" />
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-container class="px-0">
        <v-row>
          <v-col cols="12" class="py-0 pb-3" v-if="!(companyDetail && companyDetail.companyId)">
            <h2>Company Details</h2><v-spacer></v-spacer>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="Company Name"
              v-model="companyDetail.companyName"
              class="required"
              required
              data-vv-scope="refCompany"
              data-vv-name="Company Name"
              :error-messages="errors.collect('Company Name')"
              v-validate="'required'"
            />
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field label="Address" v-model.trim="companyDetail.address"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field label="City" v-model.trim="companyDetail.city"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field label="State" v-model.trim="companyDetail.state"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="Office Number"
              v-model.trim="companyDetail.phoneNumber"
              data-vv-scope="refCompany"
              data-vv-name="Office Number"
              :error-messages="validationMessage('Office Number')"
              v-validate="{ regex:/^\+?[\d ]+$/ }"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0">
            <v-text-field
              label="Mobile Number"
              v-model.trim="companyDetail.optionalNumber"
              data-vv-scope="refCompany"
              data-vv-name="Mobile Number"
              :error-messages="validationMessage('Mobile Number')"
              v-validate="{ regex:/^\+?[\d ]+$/ }"
            ></v-text-field>
          </v-col>
          <v-col cols="12" class="py-0 pb-3" v-if="!(companyDetail && companyDetail.companyId)">
            <h2>User Details</h2><v-spacer></v-spacer>
          </v-col>
          <v-col cols="12" sm="6" class="py-0" v-if="!(companyDetail && companyDetail.companyId)">
            <v-text-field
              label="First Name"
              v-model.trim="companyDetail.userFirstName"
              class="required"
              required
              data-vv-scope="refCompany"
              data-vv-name="First Name"
              :error-messages="errors.collect('First Name')"
              v-validate="'required'"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0" v-if="!(companyDetail && companyDetail.companyId)">
            <v-text-field
              label="Last Name"
              v-model.trim="companyDetail.userLastName"
              class="required"
              required
              data-vv-scope="refCompany"
              data-vv-name="Last Name"
              :error-messages="errors.collect('Last Name')"
              v-validate="'required'"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0" v-if="!(companyDetail && companyDetail.companyId)">
            <v-text-field
              label="Email"
              v-model="companyDetail.userEmail"
              class="required"
              required
              data-vv-scope="refCompany"
              data-vv-name="Email"
              :error-messages="errors.collect('Email')"
              v-validate="'required|email'"
              :disabled="companyDetail && companyDetail.companyId ? true : false"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="text-center pa-3">
      <v-spacer></v-spacer>
      <v-btn text class="m-auto" @click="$emit('onCompanyDialogClose')">Cancel</v-btn>
      <v-btn text class="m-auto primary" :loading="isLoading" @click="addOrEditCompanyDetail">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped></style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import CompanyModel from "@/models/CompanyModel";
import Shared from "../common/shared";
import CompanyController from "../api/companyController";

@Component
export default class AddUpdateCompany extends Vue {
  @Prop() private company: CompanyModel | null;
  private isLoading: boolean = false;

  private get companyDetail(): CompanyModel | null {
    return Object.assign({}, this.company);
  }

  private async validate(): Promise<boolean> {
    const result: boolean = await this.$validator.validateAll("refCompany");
    // set focus to non validate field
    if (!result) {
      Shared.setValidationFocus(this.$el as HTMLElement);
    }
    return result;
  }

  private addOrEditCompanyDetail() {
    const userEmail: string | null = localStorage.getItem(Shared.lsUserEmailId);
    if (!userEmail) {
      this.$router.push("/login");
    }
    this.validate().then((result: boolean) => {
      if (result && this.companyDetail && userEmail) {
        this.isLoading = true;
        // this.companyDetail.userEmail = userEmail;
        CompanyController.addUpdateCompany(this.companyDetail, userEmail)
          .then((res: CompanyModel | string) => {
            if (typeof res !== "string") {
              this.$emit("onSaveCompanyDetail", res);
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
    return message === "The Office Number field format is invalid." ||
      message === "The Mobile Number field format is invalid."
      ? (message = "Invalid " + errorMessage)
      : message;
  }
}
</script>
