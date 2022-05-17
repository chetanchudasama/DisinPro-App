<template>
  <div class="login-page auth-page">
    <v-form class="auth-form white elevation-3">
      <v-container class="auth-container">
        <v-row>
          <v-col cols="12" class="py-0">
            <div class="logo-wrap">
              <img src="/img/logo.png" alt="Disinpro logo" />
            </div>
          </v-col>
          <v-col cols="12" class="py-0">
            <v-text-field
              label="Email Id"
              placeholder="Email Id"
              v-model="user.email"
              required
              class="required"
              data-vv-name="Email"
              data-vv-scope="refLogin"
              v-validate="'required|email'"
              :error-messages="errors.collect('Email')"
              @keyup.enter="handleLogin"
            ></v-text-field>
          </v-col>
          <v-col cols="12" class="py-0">
            <v-text-field
              label="Password"
              placeholder="Password"
              v-model="user.password"
              type="password"
              required
              class="required"
              data-vv-name="Password"
              data-vv-scope="refLogin"
              v-validate="'required'"
              :error-messages="errors.collect('Password')"
              @keyup.enter="handleLogin"
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="text-left">
            <v-btn
              class="auth-btn primary"
              min-width="150"
              :loading="isLoading"
              @click="loginUser()"
              >Login</v-btn
            >
          </v-col>
          <v-col
            cols="6"
            class="text-right d-inline-flex justify-end align-center"
          >
            <v-btn
              class="body-2 btn-link primary--text"
              :ripple="false"
              @click="forgotPassword"
              >Forgot Password?</v-btn
            >
          </v-col>
          <v-col cols="12" class="py-0" v-if="erorMessage">
            <p class="subtitle-2 body-2 red--text mb-0 mt-1 text-left">{{ erorMessage }}</p>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<style scoped></style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import AccountController from "../../api/accountController";
import UserModel from "../../models/UserModel";
import Shared from "../../common/shared";
import { UserType } from "../../common/enums";

@Component
export default class Login extends Vue {
  private user: UserModel = new UserModel();
  private erorMessage: string = "";
  private isLoading: boolean = false;

  private created() {
    Shared.clearLocalStorage();
  }

  private loginUser() {
    this.erorMessage = "";
    this.validate()
      .then((result: boolean) => {
        if (result) {
          this.isLoading = true;
          debugger;
          AccountController.userLogin(this.user)
            .then((res: any) => {
              debugger
              if (res.data) {
                localStorage.setItem(
                  Shared.lsTokenName,
                  res.data.token,
                );
                const user = res.data.user;
                localStorage.setItem(
                  Shared.lsUserEmailId,
                  user.email,
                );
                localStorage.setItem(
                  Shared.lsUserName,
                  user.firstName + " " + user.lastName,
                );
                localStorage.setItem(
                  Shared.lsUserIsActive,
                  user.isActive,
                );
                localStorage.setItem(
                  Shared.lsUserType,
                  user.userType.type,
                );

                if (user.userType.type === UserType[UserType.SuperAdmin]) {
                  this.$router.push("/companies");
                  localStorage.setItem(
                  Shared.lsCompanyName,
                  'Super Admin',
                );
                } else if (
                  user.userType.type === UserType[UserType.CompanyAdmin]
                ) {
                  this.$router.push("/locations");
                  localStorage.setItem(
                  Shared.lsCompanyName,
                  user.company.companyName,
                );
                } else {
                  this.erorMessage = "Not a valid user";
                }
              } else {
                this.erorMessage = "Please enter valid credentials";
              }
              this.isLoading = false;
            })
            .catch((err: any) => {
              // TODO: handle error
              this.isLoading = false;
            });
        }
      })
      .catch((err: any) => {
        // TODO: handle error
      });
  }

  private forgotPassword() {
    this.$router.push("/forgotpassword");
  }

  private async validate(): Promise<boolean> {
    const result: boolean = await this.$validator.validateAll("refLogin");
    // set focus to non validate field
    if (!result) {
      Shared.setValidationFocus(this.$el as HTMLElement);
    }
    return result;
  }

  private handleLogin() {
    this.loginUser();
  }
}
</script>
