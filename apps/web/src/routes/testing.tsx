import { eden } from '@/lib/eden';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/testing')({
  component: RouteComponent,
})

function RouteComponent() {

  const {data} = useQuery({
    queryKey: ["status"],
    queryFn: () => eden.api.restaurant.auth.stats
  });

  return <div>Hello "/testing"!</div>
}
