import type { Metadata } from "next";
import Layout from "@/../components/Layout";
import AdminPanel from "@/../components/AdminPanel";

export const metadata: Metadata = {
  title: "Admin · Julka's QA Log",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Layout>
      <AdminPanel />
    </Layout>
  );
}
