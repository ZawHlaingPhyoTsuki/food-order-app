import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `;

function HomeComponent() {
  const { eden } = Route.useRouteContext();
  const { data } = useQuery({
    queryKey: ["status"],
    queryFn: () => eden.health.get(),
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          {JSON.stringify(data, null, 2)}
        </section>
        <Link to="/admin/dashboard" className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Admin Dashboard</h2>
        </Link>
        <Link to="/dashboard" className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Dashboard</h2>
        </Link>
        <Link to="/login" className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Login</h2>
        </Link>
        <Link to="/testing" className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Testing</h2>
        </Link>
      </div>
    </div>
  );
}
