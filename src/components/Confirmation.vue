<template>
  <div>
    <v-layout row justify-center>
      <v-dialog v-model="dialog" persistent max-width="400" content-class="delete-dailog">
        <v-btn color="primary" dark style="display: none;">Open Dialog</v-btn>
        <v-card>
          <v-card-title>
            <h4 class="grey--text text--darken-3">Confirm</h4>
            <v-btn class="icon-btn close-btn" @click="onCancel">
              <img src="/img/close-icon.svg" alt="Close Icon" />
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="py-6">
            <span class="icon-wrap email-icon" v-if="isShowEmailIcon">
              <img src="/img/send-emai-icon.svg" alt="Email Icon" />
            </span>
            <span class="icon-wrap" v-else>
              <img src="/img/caution-icon.svg" alt="Caution Icon" />
            </span>
            <p class="font-weight-medium body-1 mb-0 text-left">{{ message }}</p>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="text-center pa-3">
            <v-spacer></v-spacer>
            <v-btn text class="m-auto" @click="onCancel">
              {{
              negativeActionText
              }}
            </v-btn>
            <v-btn text class="m-auto primary" @click="onConfirm">
              {{
               isShowEmailIcon ? "Send Email" : positiveActionText
              }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>

<style scoped>
.delete-dailog .v-card__text {
  display: flex;
  align-items: center;
  justify-content: center;
}
.delete-dailog .v-card__text .icon-wrap {
  display: inline-block;
  width: 30px;
  height: 30px;
  margin-right: 15px;
}
.delete-dailog .v-card__text .icon-wrap img {
  width: 100%;
  height: 100%;
}
.delete-dailog .v-card__text .icon-wrap.email-icon {
  width: 55px;
  height: 55px;
}
</style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Shared from "@/common/shared";

@Component
export default class Confirmation extends Vue {
  public positiveActionText: string = "Delete";
  public negativeActionText: string = "Cancel";
  private dialog: boolean = false;
  private item: any;
  private message: string = "";
  private parentComponent: any;
  private callbackMethodName: string;
  private callbackMethodNameCancel: string;
  private isShowEmailIcon: boolean = false;

  public open(
    message: string,
    name: string,
    type: string,
    negativeActionText: string,
    positiveActionText: string,
    parentComponent: any,
    callbackMethodName: string,
    item: any,
    callbackMethodNameCancel: string = "",
    isShowEmailIcon: boolean = false,
  ) {
    this.item = item;
    this.positiveActionText = positiveActionText
      ? positiveActionText
      : this.positiveActionText;
    this.negativeActionText = negativeActionText
      ? negativeActionText
      : this.negativeActionText;
    this.message = message
      ? message
      : "Do you really want to delete " +
        type +
        (name ? " : " + name + "?" : "?");
    this.parentComponent = parentComponent;
    this.callbackMethodName = callbackMethodName;
    this.dialog = true;
    this.callbackMethodNameCancel = callbackMethodNameCancel;
    this.isShowEmailIcon = isShowEmailIcon;
  }

  private created() {
    Shared.confirmationPopup = this;
  }

  private onConfirm() {
    try {
      this.dialog = false;
      if (this.parentComponent != null) {
        this.parentComponent[this.callbackMethodName](this.item);
      } else {
        this.$emit("DialogConfirm", this.item);
      }
    } catch (e) {
      // TODO: handle error
    }
  }

  private onCancel() {
    try {
      this.dialog = false;
      if (this.parentComponent != null && this.callbackMethodNameCancel) {
        this.parentComponent[this.callbackMethodNameCancel](this.item);
      } else {
        this.$emit("DialogCancel", this.item);
      }
    } catch (e) {
      // TODO: handle error
    }
  }
}
</script>
