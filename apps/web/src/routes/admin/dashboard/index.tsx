import { createFileRoute } from "@tanstack/react-router";

import { SectionCards } from "@/components/admin/sidebar/section-cards";
import { DataTable } from "@/components/admin/data-table";

import data from "@/lib/data.json";

export const Route = createFileRoute("/admin/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <SectionCards />
      <DataTable data={data} />
    </>
  );
}
