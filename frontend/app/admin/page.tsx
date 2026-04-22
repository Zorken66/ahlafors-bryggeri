import { redirect } from "next/navigation";

import CmsAdmin from "@/components/admin/CmsAdmin";
import { getCmsSession } from "@/lib/cms-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getCmsSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-stone-100 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <CmsAdmin username={session.username} role={session.role} />
      </div>
    </div>
  );
}
