import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  useListFoodLogs,
  getListFoodLogsQueryKey,
  useDeleteFoodLog,
  useCreateFoodLog,
  useListFoods,
  getListFoodsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CalendarIcon, Search, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = typeof mealTypes[number];

export default function Log() {
  const [date, setDate] = useState<Date>(new Date());
  const dateStr = format(date, "yyyy-MM-dd");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>("breakfast");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<{
    id: number; name: string; calories: number; protein: number; carbs: number; fat: number; servingSize: string; servingUnit?: string | null;
  } | null>(null);
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: logs, isLoading } = useListFoodLogs(
    { date: dateStr },
    { query: { queryKey: getListFoodLogsQueryKey({ date: dateStr }) } }
  );

  const { data: foods, isLoading: foodsLoading } = useListFoods(
    { search: debouncedSearch, limit: 20 },
    {
      query: {
        queryKey: getListFoodsQueryKey({ search: debouncedSearch, limit: 20 }),
        enabled: dialogOpen,
      },
    }
  );

  const deleteLog = useDeleteFoodLog({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFoodLogsQueryKey({ date: dateStr }) });
        toast({ title: "Entry deleted" });
      },
    },
  });

  const createLog = useCreateFoodLog({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFoodLogsQueryKey({ date: dateStr }) });
        toast({ title: "Food logged!" });
        closeDialog();
      },
      onError: () => {
        toast({ title: "Failed to log food", variant: "destructive" });
      },
    },
  });

  const openDialog = (mealType: MealType) => {
    setActiveMealType(mealType);
    setSelectedFood(null);
    setSearch("");
    setQuantity("1");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedFood(null);
    setSearch("");
    setQuantity("1");
  };

  const qty = parseFloat(quantity) || 1;
  const computedCals = selectedFood ? Math.round(selectedFood.calories * qty) : 0;
  const computedProtein = selectedFood ? Math.round(selectedFood.protein * qty * 10) / 10 : 0;
  const computedCarbs = selectedFood ? Math.round(selectedFood.carbs * qty * 10) / 10 : 0;
  const computedFat = selectedFood ? Math.round(selectedFood.fat * qty * 10) / 10 : 0;

  const handleSubmit = () => {
    if (!selectedFood) return;
    createLog.mutate({
      data: {
        date: dateStr,
        mealType: activeMealType,
        foodId: selectedFood.id,
        quantity: qty,
        calories: computedCals,
        protein: computedProtein,
        carbs: computedCarbs,
        fat: computedFat,
      },
    });
  };

  const groupedLogs = mealTypes.reduce(
    (acc, type) => {
      acc[type] = logs?.filter((log) => log.mealType === type) || [];
      return acc;
    },
    {} as Record<string, typeof logs>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Food Log</h1>
          <p className="text-muted-foreground mt-1">Track your meals for the day.</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal w-[240px]")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          : mealTypes.map((mealType) => {
              const mealLogs = groupedLogs[mealType] || [];
              const totalCalories = mealLogs.reduce((sum, log) => sum + log.calories, 0);

              return (
                <Card key={mealType} className="shadow-sm border-muted">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="capitalize text-xl">{mealType}</CardTitle>
                      <CardDescription>{totalCalories} kcal</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => openDialog(mealType)}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Food</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {mealLogs.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                        No foods logged for {mealType} yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mealLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors group"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {log.food?.name || log.customFoodName}
                                <span className="text-muted-foreground font-normal ml-2">
                                  ×{log.quantity} {log.food?.servingUnit || "serving"}
                                </span>
                              </p>
                              <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                                <span>{log.calories} kcal</span>
                                <span>P: {log.protein}g</span>
                                <span>C: {log.carbs}g</span>
                                <span>F: {log.fat}g</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                              onClick={() => deleteLog.mutate({ id: log.id })}
                              disabled={deleteLog.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="capitalize">Add food to {activeMealType}</DialogTitle>
          </DialogHeader>

          {!selectedFood ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search foods..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2">
                {foodsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-md" />
                  ))
                ) : foods?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm">No foods found.</p>
                ) : (
                  foods?.map((food) => (
                    <button
                      key={food.id}
                      className="w-full text-left p-3 rounded-md border hover:bg-muted/60 transition-colors"
                      onClick={() => setSelectedFood(food)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{food.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {food.servingSize} {food.servingUnit} · P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                          </p>
                        </div>
                        <span className="font-bold text-primary text-sm">{food.calories} kcal</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between p-3 rounded-md bg-muted/40">
                <div>
                  <p className="font-semibold">{selectedFood.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedFood.servingSize} {selectedFood.servingUnit} = {selectedFood.calories} kcal
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedFood(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Servings</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="bg-muted/40 rounded p-2">
                  <div className="font-bold">{computedCals}</div>
                  <div className="text-xs text-muted-foreground">kcal</div>
                </div>
                <div className="bg-blue-500/10 text-blue-600 rounded p-2">
                  <div className="font-bold">{computedProtein}g</div>
                  <div className="text-xs">Protein</div>
                </div>
                <div className="bg-orange-500/10 text-orange-600 rounded p-2">
                  <div className="font-bold">{computedCarbs}g</div>
                  <div className="text-xs">Carbs</div>
                </div>
                <div className="bg-purple-500/10 text-purple-600 rounded p-2">
                  <div className="font-bold">{computedFat}g</div>
                  <div className="text-xs">Fat</div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={createLog.isPending}>
                  {createLog.isPending ? "Logging..." : "Log Food"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
