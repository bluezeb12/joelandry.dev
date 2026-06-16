import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { listApplicationSlugs, getApplication } from "@/lib/data";
import AdminLoginForm from "./AdminLoginForm";
import AdminDashboard from "./AdminDashboard";

export const runtime = "edge";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth")?.value;
  const isAuthorized = token ? await verifyToken(token, "admin") : false;

  if (!isAuthorized) {
    return <AdminLoginForm />;
  }

  // Get all application configurations
  const slugs = await listApplicationSlugs();
  const applications = await Promise.all(
    slugs.map(async (slug) => {
      return await getApplication(slug);
    })
  );

  // Filter out any null configurations
  const validApplications = applications.filter(
    (app): app is NonNullable<typeof app> => app !== null
  );

  return <AdminDashboard applications={validApplications} />;
}
