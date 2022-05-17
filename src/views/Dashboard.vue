<template>
  <div height="100%">
    <v-app-bar height="65" class="app-toolbar px-6" app fixed>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" dark class="menu-toggle">
        <img src="/img/menu-icon.svg" alt="logo" />
      </v-app-bar-nav-icon>
      <v-toolbar-title class="logo-wrap">
        <img src="/img/logo.png" alt="logo" />
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="secondary" @click="logout">Logout</v-btn>
    </v-app-bar>
    <v-navigation-drawer
      persistent
      v-model="drawer"
      dark
      class="primary text-left side-menu"
      color="white--text"
      fixed
      app
      :clipped="clipped"
      disable-resize-watcher
      hide-overlay
    >
      <v-list dense nav class="py-0 px-3">
        <v-list-item two-line :class="miniVariant && 'px-0'" class="mb-0">
          <!-- <v-list-item-avatar>
          <img src="https://randomuser.me/api/portraits/men/81.jpg" />
          </v-list-item-avatar>-->
          <v-list-item-content>
            <v-list-item-title class="title">
              {{
              getCompanyName
              }}
            </v-list-item-title>
            <!-- <v-list-item-subtitle>Super Admin</v-list-item-subtitle> -->
          </v-list-item-content>
        </v-list-item>
        <v-divider class="mb-2"></v-divider>
        <v-list-item
          v-for="item in menuItems"
          :key="item.text"
          link
          @click="subMenuItemClick(item.path)"
          class="px-3"
        >
          <!-- <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>-->
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>
<style scoped>
.app-toolbar >>> .v-toolbar__content {
  padding: 0;
}
.app-toolbar >>> .v-toolbar__content .v-btn.menu-toggle {
  width: 27px;
  height: 27px;
  margin: 0 !important;
}
.menu-toggle >>> span,
.menu-toggle img {
  width: 100%;
  height: 100%;
}
.logo-wrap {
  max-width: 120px;
  margin-top: 10px;
}
.logo-wrap img {
  width: 100%;
  height: 100%;
}
</style>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Shared from "../common/shared";
import AccountController from "../api/accountController";
import UserModel from "../models/UserModel";
import { UserType } from "@/common/enums";
import eventBus from "@/common/bus";

@Component
export default class Dashboard extends Vue {
  private drawer: boolean = false;
  private showNavDrawer: boolean = false;
  private snackbar: boolean = false;
  private snackbarColor: string = "";
  private snackbarText: string = "";
  private miniVariant: boolean = true;
  private clipped: boolean = false;
  private menuItems: any = [];
  private userData: UserModel | null = null;

  private get getCompanyName() {
    return localStorage.getItem(Shared.lsCompanyName)
      ? localStorage.getItem(Shared.lsCompanyName)
      : localStorage.getItem(Shared.lsUserName);
  }

  private created() {
    const userEmailId: string | null = localStorage.getItem(
      Shared.lsUserEmailId,
    );
    const userType: string | null = localStorage.getItem(Shared.lsUserType);
    if (userEmailId && userType) {
      if (userType === UserType[UserType.SuperAdmin]) {
        this.menuItems.push({
          path: "/companies",
          icon: "mdi-view-dashboard",
          image: "",
          text: "Companies",
        });
      } else if (userType === UserType[UserType.CompanyAdmin]) {
        this.menuItems.push({
          path: "/locations",
          icon: "mdi-view-dashboard",
          image: "",
          text: "Locations",
        });
        this.menuItems.push({
          path: "/users",
          icon: "mdi-view-dashboard",
          image: "",
          text: "Users",
        });
        this.menuItems.push({
          path: "/assets",
          icon: "mdi-view-dashboard",
          image: "",
          text: "Assets",
        });
        this.menuItems.push({
          path: "/scanEntries",
          icon: "mdi-view-dashboard",
          image: "",
          text: "Scan Entries",
        });
      }
    } else {
      this.$router.push("/login");
    }
  }

  private subMenuItemClick(to: string) {
    if (to !== "") {
      this.$router.push({
        path: to,
      });
    }
  }

  private logout() {
    this.$router.push("/login");
  }

  @Watch("drawer")
  private drawerValueChange() {
    eventBus.$emit("isShowDrawer", this.drawer);
  }
}
</script>
