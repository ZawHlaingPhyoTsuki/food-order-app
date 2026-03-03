import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/register")({
  component: RegisterRestaurant,
});

function RegisterRestaurant() {
  const { eden } = Route.useRouteContext();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      phone: "",
      address: "",
      city: "",
      country: "TH",
      currency: "THB",
      defaultLanguage: "th",
    },
    onSubmit: async ({ value }) => {
      const result = await eden.api.restaurant.auth.register.post(value as any, {
        fetch: { credentials: "include" },
      });

      if (result.error) {
        toast.error(String(result.error));
        return;
      }

      toast.success("Restaurant registered! Awaiting admin approval.");
      navigate({ to: "/dashboard" });
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        description: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().length(2),
        currency: z.string().length(3),
        defaultLanguage: z.string(),
      }),
    },
  });

  return (
    <div className="container mx-auto max-w-lg py-10">
      <Card>
        <CardHeader>
          <CardTitle>Register Your Restaurant</CardTitle>
          <CardDescription>
            Fill in the details to register your restaurant on the platform. An admin will review
            your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Restaurant Name *</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Som Tum Cafe"
                  />
                  {field.state.meta.errors.map((err) => (
                    <p key={err?.message} className="text-red-500 text-sm">
                      {err?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Description</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="A short description of your restaurant"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Phone</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="+66 XX XXX XXXX"
                  />
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="address">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Address</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="city">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>City</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? "Submitting..." : "Register Restaurant"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
