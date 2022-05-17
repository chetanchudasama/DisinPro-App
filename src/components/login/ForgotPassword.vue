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
            <h3 class="font-weight-medium">Forgot password</h3>
          </v-col>
          <v-col cols="12" class="py-0">
            <v-text-field
              label="Email Address"
              placeholder="Email Address"
              v-model="user.email"
              required
              class="required"
              v-validate="'required|email'"
              data-vv-name="Email Address"
              :error-messages="errors.collect('Email Address')"
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="text-left">
            <v-btn
              class="auth-btn primary"
              min-width="150"
              @click="resetPassword"
              :loading="isLoading"
            >Reset password</v-btn>
          </v-col>
          <v-col cols="6" class="text-right d-inline-flex justify-end align-center">
            <v-btn class="body-2 btn-link primary--text" :ripple="false" @click="login">Login</v-btn>
          </v-col>
          <v-col cols="12" class="py-0" v-if="forgotPasswordResponse">
            <p
              class="subtitle-2 body-2 mb-0 mt-1 text-left"
              :class="linkSend ? 'green--text' : 'red--text'"
            >{{forgotPasswordResponse}}</p>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<style scoped>
</style>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';
import Shared from '../../common/shared';
import AccountController from '../../api/accountController';
import UserModel from '../../models/UserModel';
import ResponseModel from '../../models/ResponseModel';

@Component
export default class ForgotPassword extends Vue {
  private user: UserModel = new UserModel();
  private forgotPasswordResponse: string = "";
  private linkSend: boolean = false;
  private isLoading: boolean = false;

  private created() {
    Shared.clearLocalStorage();
  }

  private login() {
    this.$router.push('/login');
  }

  private resetPassword() {
    this.validate().then((result: boolean) => {
      if (result) {
        this.forgotPasswordResponse = "";
        this.isLoading = true;
        AccountController.fogotPassword(this.user).then((res: ResponseModel) => {
          this.linkSend = res.status;
          this.forgotPasswordResponse = res.message;
          this.isLoading = false;
        }).catch((err: any) => {
          // TODO: handle error
          this.isLoading = false;
        });
      }
    }).catch((err: any) => {
        // TODO: handle error
    });
  }

  private async validate(): Promise<boolean> {
    const result: boolean = await this.$validator.validateAll();
    // set focus to non validate field
    if (!result) {
        Shared.setValidationFocus(this.$el as HTMLElement);
    }
    return result;
  }
}
</script>
