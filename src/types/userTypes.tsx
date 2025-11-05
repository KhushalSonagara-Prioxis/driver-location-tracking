import { Role } from "../types/enums";

export interface DriverDropdown {
  userSID: string;
  userName: string;
}


export interface AuthUser {
  token: string;
  role: Role;
}
