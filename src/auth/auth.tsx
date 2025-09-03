import { cookies } from "next/headers";
import { Role, Status } from "../types/enums";

export interface AuthUser {
  id: string;
  role: Role;
  status: Status;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  const id = cookieStore.get("userId")?.value;
  const role = cookieStore.get("role")?.value;
  const status = cookieStore.get("status")?.value;

  if (!id || !role || !status) return null;

  return {
    id,
    role: Number(role) as Role,
    status: Number(status) as Status,
  };
}
