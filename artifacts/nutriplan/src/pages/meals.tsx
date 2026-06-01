import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  useListMeals,
  getListMealsQueryKey,
  useCreateMeal,
  useLogMeal,
  getListFoodLogsQueryKey,
  useListFoods,
  getListFoodsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Utensils, Search, X, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface MealItem {
  foodId: number;
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function Meals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: meals, isLoading } = useListMeals(
    { query: { queryKey: getListMealsQueryKey() } }
  );

  // Create Meal dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealDesc, setMealDesc] = useState("");
  const [items, setItems] = useState<MealItem[]>([]);
  const [foodSearch, setFoodSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [pendingFood, setPendingFood] = useState<{ id: number; name: string; calories: number; protein: number; carbs: number; fat: number } | null>(null);
  const [pendingQty, setPendingQty] = useState("1");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(foodSearch), 300);
    return () => clearTimeout(t);
  }, [foodSearch]);

  const { data: foods, isLoading: foodsLoading } = useListFoods(
    { search: debouncedSearch, limit: 20 },
    { query: { queryKey: getListFoodsQueryKey({ search: debouncedSearch, limit: 20 }), enabled: addingItem } }
  );

  // Log Meal dialog
  const [logOpen, setLogOpen] = useState(false);
  const [logMealId, setLogMealId] = useState<number | null>(null);
  const [logDate, setLogDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [logMealType, setLogMealType] = useState<MealType>("breakfast");

  const createMeal = useCreateMeal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMealsQueryKey() });
        toast({ title: "Meal created!" });
        closeCreate();
      },
      onError: () => toast({ title: "Failed to create meal", variant: "destructive" }),
    },
  });

  const logMeal = useLogMeal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFoodLogsQueryKey({ date: logDate }) });
        toast({ title: "Meal logged to food log!" });
        setLogOpen(false);
      },
      onError: () => toast({ title: "Failed to log meal", variant: "destructive" }),
    },
  });

  const closeCreate = () => {
    setCreateOpen(false);
    setMealName("");
    setMealDesc("");
    setItems([]);
    setFoodSearch("");
    setAddingItem(false);
    setPendingFood(null);
    setPendingQty("1");
  };

  const confirmAddItem = () => {
    if (!pendingFood) return;
    const qty = parseFloat(pendingQty) || 1;
    setItems((prev) => [
      ...prev,
      {
        foodId: pendingFood.id,
        name: pendingFood.name,
        quantity: qty,
        calories: Math.round(pendingFood.calories * qty),
        protein: Math.round(pendingFood.protein * qty * 10) / 10,
        carbs: Math.round(pendingFood.carbs * qty * 10) / 10,
        fat: Math.round(pendingFood.fat * qty * 10) / 10,
      },
    ]);
    setPendingFood(null);
    setPendingQty("1");
    setFoodSearch("");
    setAddingItem(false);
  };

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const totalCals = items.reduce((s, i) => s + i.calories, 0);
  const totalProtein = Math.round(items.reduce((s, i) => s + i.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(items.reduce((s, i) => s + i.carbs, 0) * 10) / 10;
  const totalFat = Math.round(items.reduce((s, i) => s + i.fat, 0) * 10) / 10;

  const handleCreate = () => {
    if (!mealName.trim()) {
      toast({ title: "Meal name is required", variant: "destructive" });
      return;
    }
    if (items.length === 0) {
      toast({ title: "Add at least one food item", variant: "destructive" });
      return;
    }
    createMeal.mutate({
      data: {
        name: mealName,
        description: mealDesc || null,
        items: items.map((it) => ({
          foodId: it.foodId,
          quantity: it.quantity,
          calories: it.calories,
          protein: it.protein,
          carbs: it.carbs,
          fat: it.fat,
        })),
      },
    });
  };

  const openLog = (id: number) => {
    setLogMealId(id);
    setLogDate(format(new Date(), "yyyy-MM-dd"));
    setLogMealType("breakfast");
    setLogOpen(true);
  };

  const handleLog = () => {
    if (!logMealId) return;
    logMeal.mutate({
      id: logMealId,
      data: { date: logDate, mealType: logMealType },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Meals</h1>
          <p className="text-muted-foreground mt-1">Create and manage your favorite meal templates.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Meal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))
        ) : meals?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            <Utensils className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>You haven't saved any meals yet.</p>
            <p className="text-sm">Create templates for things you eat often to log them quickly.</p>
          </div>
        ) : (
          meals?.map((meal) => (
            <Card key={meal.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{meal.name}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {meal.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-primary">{meal.totalCalories} kcal</div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-center">
                    <div className="bg-blue-500/10 text-blue-600 rounded p-2">
                      <div className="font-semibold">{meal.totalProtein}g</div>
                      <div className="text-xs">Protein</div>
                    </div>
                    <div className="bg-orange-500/10 text-orange-600 rounded p-2">
                      <div className="font-semibold">{meal.totalCarbs}g</div>
                      <div className="text-xs">Carbs</div>
                    </div>
                    <div className="bg-purple-500/10 text-purple-600 rounded p-2">
                      <div className="font-semibold">{meal.totalFat}g</div>
                      <div className="text-xs">Fat</div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-6" onClick={() => openLog(meal.id)}>
                  Log this meal
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Meal Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => !open && closeCreate()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Meal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Meal Name *</Label>
              <Input
                placeholder="e.g. High Protein Breakfast"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                placeholder="Optional description..."
                value={mealDesc}
                onChange={(e) => setMealDesc(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Food Items</Label>
                {!addingItem && (
                  <Button size="sm" variant="outline" onClick={() => setAddingItem(true)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Food
                  </Button>
                )}
              </div>

              {addingItem && (
                <div className="border rounded-md p-3 space-y-3 bg-muted/20">
                  {!pendingFood ? (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search foods..."
                          className="pl-9 h-9"
                          value={foodSearch}
                          onChange={(e) => setFoodSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {foodsLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : foods?.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-3">No foods found.</p>
                        ) : (
                          foods?.map((food) => (
                            <button
                              key={food.id}
                              className="w-full text-left px-2 py-1.5 rounded hover:bg-muted text-sm flex justify-between"
                              onClick={() => setPendingFood(food)}
                            >
                              <span>{food.name}</span>
                              <span className="text-primary font-medium">{food.calories} kcal</span>
                            </button>
                          ))
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setAddingItem(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{pendingFood.name}</span>
                        <span className="text-xs text-muted-foreground">{pendingFood.calories} kcal/serving</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Servings</Label>
                        <Input
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={pendingQty}
                          onChange={(e) => setPendingQty(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={confirmAddItem}>Add</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setPendingFood(null); setPendingQty("1"); }}>
                          Back
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {items.length > 0 && (
                <div className="space-y-1.5">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/40 text-sm">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground ml-1.5">×{item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-medium">{item.calories} kcal</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeItem(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                    <span>Total</span>
                    <span className="text-primary">{totalCals} kcal · P:{totalProtein}g C:{totalCarbs}g F:{totalFat}g</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCreate}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMeal.isPending}>
              {createMeal.isPending ? "Creating..." : "Create Meal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Meal Dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Log Meal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Meal Type</Label>
              <Select value={logMealType} onValueChange={(v) => setLogMealType(v as MealType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)}>Cancel</Button>
            <Button onClick={handleLog} disabled={logMeal.isPending}>
              {logMeal.isPending ? "Logging..." : "Log Meal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
