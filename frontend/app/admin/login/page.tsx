import { redirect } from "next/navigation";

import CmsLoginForm from "@/components/admin/CmsLoginForm";
import { getCmsSession } from "@/lib/cms-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getCmsSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-stone-100 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <CmsLoginForm />
      </div>
    </div>
  );
}
