import { redirect } from "next/navigation";
import { getAuthUser } from "@/auth/auth";
import { Role, Status } from "@/types/enums";

export default async function HomePage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.status !== Status.Active) {
    redirect("/auth/login");
  }

  if (user.role === Role.Admin) {
    redirect("/admin/dashboard");
  }

  if (user.role === Role.Driver) {
    redirect("/driver/trips");
  }

  redirect("/auth/login");
}
