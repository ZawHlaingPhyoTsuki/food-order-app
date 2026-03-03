import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/menu")({
  component: MenuPage,
});

function MenuPage() {
  const { eden, orgStatus } = Route.useRouteContext();
  const orgId = orgStatus?.organization?.id;
  const queryClient = useQueryClient();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    description: "",
  });

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["menu-categories", orgId],
    queryFn: () =>
      eden.api.restaurant[orgId!]["menu-category"].get({
        fetch: { credentials: "include" },
      }),
    enabled: !!orgId,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      return eden.api.restaurant[orgId!]["menu-category"].post({ name } as any, {
        fetch: { credentials: "include" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      setShowAddCategory(false);
      setNewCategoryName("");
      toast.success("Category created");
    },
    onError: () => toast.error("Failed to create category"),
  });

  const createItemMutation = useMutation({
    mutationFn: async ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: { name: string; price: number; description: string };
    }) => {
      return eden.api.restaurant[orgId!].menu.post(
        {
          name: data.name,
          price: data.price,
          description: data.description,
          categoryId,
        } as any,
        { fetch: { credentials: "include" } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      setShowAddItem(null);
      setNewItem({ name: "", price: 0, description: "" });
      toast.success("Menu item created");
    },
    onError: () => toast.error("Failed to create item"),
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return eden.api.restaurant[orgId!].menu[itemId].toggle.patch(undefined as any, {
        fetch: { credentials: "include" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      toast.success("Availability toggled");
    },
  });

  const categories = (categoriesData?.data as any[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <Button onClick={() => setShowAddCategory(true)}>Add Category</Button>
      </div>

      {showAddCategory && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Category Name</Label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Appetizers"
                />
              </div>
              <Button
                onClick={() => createCategoryMutation.mutate(newCategoryName)}
                disabled={!newCategoryName || createCategoryMutation.isPending}
              >
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading menu...</p>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground">
          No categories yet. Create your first category to get started.
        </p>
      ) : (
        categories.map((category: any) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{category.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {category._count?.menuItems ?? 0} items
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setShowAddItem(category.id)}>
                    Add Item
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showAddItem === category.id && (
                <div className="mb-4 p-4 border rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Item Name</Label>
                      <Input
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="e.g., Pad Thai"
                      />
                    </div>
                    <div>
                      <Label>Price (THB)</Label>
                      <Input
                        type="number"
                        value={newItem.price}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            price: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          description: e.target.value,
                        })
                      }
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        createItemMutation.mutate({
                          categoryId: category.id,
                          data: newItem,
                        })
                      }
                      disabled={!newItem.name || !newItem.price || createItemMutation.isPending}
                    >
                      Add Item
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddItem(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {category.menuItems?.length > 0 ? (
                <div className="space-y-2">
                  {category.menuItems?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{item.price} THB</span>
                        <Badge
                          variant={item.isAvailable ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleAvailabilityMutation.mutate(item.id)}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No items in this category yet.</p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
