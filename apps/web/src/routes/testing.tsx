import { eden } from "@/lib/eden";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: testingData } = useQuery({
    queryKey: ["testing"],
    queryFn: () => eden.api.todos.testing.get(),
  });

   const { data: authData } = useQuery({
    queryKey: ["testing2"],
    queryFn: () => eden.api.todos.get(),
  });

  return (
    <div>
      <h1>Hello "/testing"!</h1>
      {/* <code>{JSON.stringify(testingData)}</code> */}
      <code>{JSON.stringify(authData)}</code>
    </div>
  );
}
