import { UserType } from './common/enums';
import Shared from "./common/shared";

export default class RouterAuth {
  // used by routing, if the route requires authentication
  public static BeforeEach(to: any, from: any, next: any) {
    if (from.name && from.name.toLowerCase() === "notfound" && to.name.toLowerCase() === "login") {
      next("/notFound");
      return;
    }
    if (to.matched.some((record: any) => record.meta.requiresAuth)) {
      if (
        localStorage.getItem(Shared.lsTokenName) === null ||
        localStorage.getItem(Shared.lsTokenName) === "" ||
        localStorage.getItem(Shared.lsUserIsActive) === "false" ||
        localStorage.getItem(Shared.lsUserIsActive) === null ||
        localStorage.getItem(Shared.lsUserIsActive) === ""
      ) {
        next({
          path: "/login",
        });
      } else {
        if (to.matched.some((record: any) => record.meta.requiresSuperAdminAuth) && localStorage.getItem(Shared.lsUserType) === UserType[UserType.SuperAdmin]) {
          next();
        } else if (to.matched.some((record: any) => record.meta.requiresCompanyAdminAuth) && localStorage.getItem(Shared.lsUserType) === UserType[UserType.CompanyAdmin]) {
          next();
        } else {
          next({
            path: "/login",
          });
        }
      }
    } else {
      next();
    }
  }
}
