<template>
  <div id="app" :class="drawer? 'show-menu' : 'hide-menu'">
    <v-app id="inspire">
      <v-main>
        <v-container fluid fill-height class="pa-0">
          <v-layout>
            <v-flex xs12>
              <dashboard v-if="isUserLoggedIn"></dashboard>
              <v-fade-transition mode="out-in" v-bar>
                <router-view :key="$route.fullPath" />
              </v-fade-transition>
            </v-flex>
          </v-layout>
        </v-container>
        <Confirmation></Confirmation>
      </v-main>
    </v-app>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.hide-menu {
  background-color: red;
}
.show-menu {
  background-color: green;
}
</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Shared from "./common/shared";
import Dashboard from "@/views/Dashboard.vue";
import Confirmation from "@/components/Confirmation.vue";
import eventBus from "@/common/bus";

@Component({
  components: { Dashboard, Confirmation },
})
export default class App extends Vue {
  public Vuebar = require("vuebar");
  public drawer: boolean = false;

  private created() {
    Vue.use(this.Vuebar);
  }

  private mounted() {
    eventBus.$on("isShowDrawer", (drawer: boolean) => {
      this.drawer = drawer;
    });
  }

  private get isUserLoggedIn(): boolean {
    return this.$route &&
      this.$route.name &&
      this.$route.name.toLowerCase() !== "login" &&
      this.$route.name.toLowerCase() !== "resetpassword" &&
      this.$route.name.toLowerCase() !== "forgotpassword" &&
      this.$route.name.toLowerCase() !== "notfound" &&
      localStorage.getItem(Shared.lsTokenName) !== null &&
      localStorage.getItem(Shared.lsTokenName) !== ""
      ? true
      : false;
  }
}
</script>
