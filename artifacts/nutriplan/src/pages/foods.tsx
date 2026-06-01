import { useState, useEffect } from "react";
import {
  useListFoods,
  getListFoodsQueryKey,
  useCreateFood,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const emptyForm = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  fiber: "",
  servingSize: "",
  servingUnit: "",
};

export default function Foods() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: foods, isLoading } = useListFoods(
    { search: debouncedSearch, limit: 50 },
    { query: { queryKey: getListFoodsQueryKey({ search: debouncedSearch, limit: 50 }) } }
  );

  const createFood = useCreateFood({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFoodsQueryKey({}) });
        toast({ title: "Custom food created!" });
        setDialogOpen(false);
        setForm(emptyForm);
      },
      onError: () => {
        toast({ title: "Failed to create food", variant: "destructive" });
      },
    },
  });

  const field = (key: keyof typeof emptyForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const handleSubmit = () => {
    if (!form.name || !form.calories || !form.servingSize) {
      toast({ title: "Name, calories and serving size are required", variant: "destructive" });
      return;
    }
    createFood.mutate({
      data: {
        name: form.name,
        calories: parseFloat(form.calories) || 0,
        protein: parseFloat(form.protein) || 0,
        carbs: parseFloat(form.carbs) || 0,
        fat: parseFloat(form.fat) || 0,
        fiber: form.fiber ? parseFloat(form.fiber) : null,
        servingSize: form.servingSize,
        servingUnit: form.servingUnit || null,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Foods</h1>
          <p className="text-muted-foreground mt-1">Browse and search the food database.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Food
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for foods..."
          className="pl-10 h-10 bg-card shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))
        ) : foods?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No foods found{search ? ` matching "${search}"` : ""}.</p>
          </div>
        ) : (
          foods?.map((food) => (
            <Card key={food.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{food.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {food.servingSize} {food.servingUnit}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{food.calories} kcal</div>
                  <div className="text-xs text-muted-foreground space-x-2">
                    <span>P: {food.protein}g</span>
                    <span>C: {food.carbs}g</span>
                    <span>F: {food.fat}g</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Food</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input placeholder="e.g. Homemade Oatmeal" {...field("name")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Serving Size *</Label>
                <Input placeholder="e.g. 100" {...field("servingSize")} />
              </div>
              <div className="space-y-1.5">
                <Label>Serving Unit</Label>
                <Input placeholder="e.g. g, ml, cup" {...field("servingUnit")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Calories *</Label>
                <Input type="number" min="0" placeholder="kcal" {...field("calories")} />
              </div>
              <div className="space-y-1.5">
                <Label>Protein (g)</Label>
                <Input type="number" min="0" placeholder="0" {...field("protein")} />
              </div>
              <div className="space-y-1.5">
                <Label>Carbs (g)</Label>
                <Input type="number" min="0" placeholder="0" {...field("carbs")} />
              </div>
              <div className="space-y-1.5">
                <Label>Fat (g)</Label>
                <Input type="number" min="0" placeholder="0" {...field("fat")} />
              </div>
              <div className="space-y-1.5">
                <Label>Fiber (g)</Label>
                <Input type="number" min="0" placeholder="optional" {...field("fiber")} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createFood.isPending}>
              {createFood.isPending ? "Creating..." : "Create Food"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
