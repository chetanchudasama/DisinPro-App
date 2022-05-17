<template>
  <div class="login-page auth-page">
    <v-form class="auth-form white elevation-3">
      <v-container class="auth-container">
        <v-row>
          <v-col cols="12" class="py-0">
            <div class="logo-wrap white">
              <img src="/img/logo.png" alt="Disinpro logo" />
            </div>
          </v-col>
          <v-col cols="12" class="py-0">
            <h3 class="font-weight-medium">Reset password</h3>
          </v-col>
          <v-col cols="12" class="py-0">
            <v-text-field
              label="New Password"
              placeholder="New Password"
              v-model.trim="resetPasswordModel.password"
              maxlength="50"
              required
              class="required"
              v-validate="'required'"
              data-vv-scope="refResetPassword"
              data-vv-name="Password"
              :error-messages="errors.collect('Password')"
              v-on:input="checkPasswordCriteria"
              :type="showPassword ? 'text' : 'password'"
              :append-icon="showPassword ? 'visibility' : 'visibility_off'"
              @click:append="showPassword = !showPassword"
              hint="Password length must be between 8 to 64 characters"
              counter="64"
            ></v-text-field>
          </v-col>

          <v-col cols="12" class="py-0">
            <v-text-field
              label="Confirm Password"
              placeholder="Confirm Password"
              v-model.trim="resetPasswordModel.verifyPassword"
              maxlength="50"
              required
              class="required"
              v-validate="'required'"
              data-vv-scope="refResetPassword"
              data-vv-name="Verify Password"
              :error-messages="errors.collect('Verify Password')"
              :type="showConfirmPassword ? 'text' : 'password'"
              :append-icon="showConfirmPassword ? 'visibility' : 'visibility_off'"
              @click:append="showConfirmPassword = !showConfirmPassword"
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="text-left">
            <v-btn
              class="auth-btn primary"
              min-width="150"
              :loading="isLoading"
              @click="saveResetPassword"
            >Change password</v-btn>
          </v-col>
          <v-col cols="6" class="text-right d-inline-flex justify-end align-center" v-if="showLoginButton">
            <v-btn class="body-2 btn-link primary--text" :ripple="false" @click="login">Login</v-btn>
          </v-col>
          <v-col cols="12" class="pb-0 pt-1 test-case">
            <p class="mb-1 font-weight-bold">The password must have at least 3 of the following:</p>
            <p
              class="mb-1 case-option"
              v-for="(criteria, index) in passwordSetCriteria"
              :key="index"
              :class="criteria.color"
            >{{criteria.text}}</p>
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <v-snackbar :timeout="snackbarTimeout" v-model="snackbar" left bottom class="snack-bar">
      {{ snackbarText }}
      <v-btn dark text @click.native="snackbar = false" color="secondary" class="icon-btn">
        <img src="/img/close-icon-black.svg" alt="close icon" />
      </v-btn>
    </v-snackbar>
  </div>
</template>
<style scoped>
.test-case p {
  font-size: 15px;
  text-align: left;
}
.case-option {
  position: relative;
  padding-left: 14px;
}
.case-option:after {
  position: absolute;
  content: "";
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #000;
  width: 5px;
  height: 5px;
  border-radius: 20px;
}
.case-option.green--text:after {
  background: #4caf50;
}
.case-option.error--text:after {
  background: #ff5252;
}
</style>

<script lang='ts'>
import { Component, Vue } from "vue-property-decorator";
import Shared from "../../common/shared";
import AccountController from "../../api/accountController";
import ResetPasswordModel from "../../models/ResetPasswordModel";
import ResponseModel from "../../models/ResponseModel";

@Component
export default class ResetPassword extends Vue {
  private showPassword: boolean = false;
  private showConfirmPassword: boolean = false;
  private isLoading: boolean = false;
  private resetPasswordModel: ResetPasswordModel = new ResetPasswordModel();
  private showLoginButton: boolean = false;
  private passwordSetCriteria: any = [
    { text: "- a lowercase letter", color: "black--text", type: "lower" },
    { text: "- an uppercase letter", color: "black--text", type: "upper" },
    { text: "- a digit", color: "black--text", type: "digit" },
    { text: "- a symbol", color: "black--text", type: "special" },
  ];
  private snackbarTimeout: number = Shared.SnackbarMessageTimeout;
  private snackbar: boolean = false;
  private snackbarText: string = "";

  private created() {
    Shared.clearLocalStorage();
  }

  private async validatePassword(): Promise<boolean> {
    const resetPasswordFormValidation: boolean = await this.$validator.validateAll(
      "refResetPassword",
    );
    // set focus to non validate field
    if (!resetPasswordFormValidation) {
      Shared.setValidationFocus(this.$el as HTMLElement);
    }

    return resetPasswordFormValidation;
  }

  private validateAndMatchPassword(): boolean {
    const password: string = this.resetPasswordModel.password;
    if (!password) {
      return false;
    }
    if (password.trim().length < 8 || password.trim().length > 64) {
      this.snackbarText = "Password length must be between 8 to 64 characters.";
      this.snackbar = true;
      return false;
    } else if (
      password.trim() !== this.resetPasswordModel.verifyPassword.trim()
    ) {
      this.snackbarText = "password and confirm-password are not same.";
      this.snackbar = true;
      return false;
    }
    return true;
  }

  private checkPasswordCriteria(): boolean {
    let result: boolean = true;
    const normalColorText = "black--text";
    const errorColorText = "error--text";
    const successColorText = "green--text";
    let password = this.resetPasswordModel.password;
    if (!password) {
      // if password is null, set all the fields to red color
      this.passwordSetCriteria.forEach((element: any) => {
        element.color = errorColorText;
      });
      return false;
    }
    password = password.trim();

    if (password.search(/[a-z]+/) < 0) {
      // if password has no small letter, show in red color
      this.passwordSetCriteria.find(
        (x: any) => x.type === "lower",
      ).color = errorColorText;
      result = false;
    } else {
      // green color
      this.passwordSetCriteria.find(
        (x: any) => x.type === "lower",
      ).color = successColorText;
    }

    if (password.search(/[A-Z]+/) < 0) {
      // if password has no capital letter, show in red color
      this.passwordSetCriteria.find(
        (x: any) => x.type === "upper",
      ).color = errorColorText;
      result = false;
    } else {
      // green color
      this.passwordSetCriteria.find(
        (x: any) => x.type === "upper",
      ).color = successColorText;
    }

    if (password.search(/[0-9]/) < 0) {
      // if password has no number, show in red color
      this.passwordSetCriteria.find(
        (x: any) => x.type === "digit",
      ).color = errorColorText;
      result = false;
    } else {
      // green color
      this.passwordSetCriteria.find(
        (x: any) => x.type === "digit",
      ).color = successColorText;
    }

    if (password.search(/[^a-zA-Z0-9]+/) < 0) {
      // if password has no special character, show in red color
      this.passwordSetCriteria.find(
        (x: any) => x.type === "special",
      ).color = errorColorText;
      result = false;
    } else {
      // green color
      this.passwordSetCriteria.find(
        (x: any) => x.type === "special",
      ).color = successColorText;
    }

    // if atleast 3 triteria matched
    // isPasswordInProperLength
    result =
      this.passwordSetCriteria.filter((x: any) => x.color === successColorText)
        .length >= 3
        ? true
        : false;
    if (result) {
      // if atleast 3 triteria matched, reset other colors
      const errorBlock = this.passwordSetCriteria.find(
        (c: any) => c.color === errorColorText,
      );
      if (errorBlock) {
        errorBlock.color = normalColorText;
      }
    }

    return result;
  }

  private saveResetPassword() {
    const self = this;
    self.validatePassword().then((result: boolean) => {
      if (
        result &&
        this.validateAndMatchPassword() &&
        this.checkPasswordCriteria()
      ) {
        self.isLoading = true;
        this.resetPasswordModel.token = this.$route.query.token;
        AccountController.resetPassword(this.resetPasswordModel)
          .then((res: ResponseModel) => {
            if (res.status) {
              this.showLoginButton = true;
            }
            self.snackbarText = res.message;
            self.snackbar = true;
            self.isLoading = false;
          })
          .catch((err: any) => {
            // TODO: handle error
            this.isLoading = false;
          });
      }
    });
  }

  private login() {
    this.$router.push('/login');
  }
}
</script>
