import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$orgSlug/table/$tableToken')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$orgSlug/table/$tableToken"!</div>
}
