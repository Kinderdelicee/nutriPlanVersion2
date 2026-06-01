import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import {
  useListMealPlans,
  getListMealPlansQueryKey,
  useListMeals,
  getListMealsQueryKey,
  useCreateMealPlanEntry,
  useDeleteMealPlanEntry,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
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

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export default function Planner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: mealPlans, isLoading } = useListMealPlans(
    { weekStart },
    { query: { queryKey: getListMealPlansQueryKey({ weekStart }) } }
  );

  const { data: meals } = useListMeals(
    { query: { queryKey: getListMealsQueryKey() } }
  );

  // Add entry dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState("");
  const [dialogMealType, setDialogMealType] = useState<MealType>("breakfast");
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null);

  const createEntry = useCreateMealPlanEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMealPlansQueryKey({ weekStart }) });
        toast({ title: "Added to planner!" });
        setDialogOpen(false);
        setSelectedMealId(null);
      },
      onError: () => toast({ title: "Failed to add to planner", variant: "destructive" }),
    },
  });

  const deleteEntry = useDeleteMealPlanEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMealPlansQueryKey({ weekStart }) });
        toast({ title: "Removed from planner" });
      },
      onError: () => toast({ title: "Failed to remove", variant: "destructive" }),
    },
  });

  const openDialog = (dateStr: string, mealType: MealType) => {
    setDialogDate(dateStr);
    setDialogMealType(mealType);
    setSelectedMealId(null);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    if (!selectedMealId) {
      toast({ title: "Please select a meal", variant: "destructive" });
      return;
    }
    createEntry.mutate({
      data: { date: dialogDate, mealType: dialogMealType, mealId: selectedMealId },
    });
  };

  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(new Date(weekStart), i);
    return {
      date,
      dateStr: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE"),
      dayNum: format(date, "d"),
    };
  });

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Planner</h1>
          <p className="text-muted-foreground mt-1">Plan your meals ahead of time.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-36 text-center">
            {format(new Date(weekStart), "MMM d")} –{" "}
            {format(addDays(new Date(weekStart), 6), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
        {days.map((day) => {
          const isToday = format(new Date(), "yyyy-MM-dd") === day.dateStr;

          return (
            <Card
              key={day.dateStr}
              className={`h-full min-h-[500px] flex flex-col ${isToday ? "border-primary ring-1 ring-primary/20" : ""}`}
            >
              <CardHeader className="pb-3 text-center border-b bg-muted/20">
                <CardTitle className="text-sm font-normal text-muted-foreground uppercase tracking-wider">
                  {day.dayName}
                </CardTitle>
                <div className={`text-2xl font-bold ${isToday ? "text-primary" : ""}`}>
                  {day.dayNum}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-2 space-y-2 overflow-y-auto mt-2">
                {isLoading ? (
                  <Skeleton className="h-20 w-full rounded-md" />
                ) : (
                  (["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((mealType) => {
                    const entry = mealPlans?.find(
                      (p) => p.date === day.dateStr && p.mealType === mealType
                    );
                    return (
                      <div key={mealType} className="border rounded-md p-2 bg-card">
                        <div className="text-xs font-medium capitalize text-muted-foreground mb-1">
                          {mealType}
                        </div>
                        {entry ? (
                          <div className="flex items-center justify-between gap-1 group">
                            <span className="text-sm font-semibold truncate flex-1" title={entry.meal?.name}>
                              {entry.meal?.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              onClick={() => deleteEntry.mutate({ id: entry.id })}
                              disabled={deleteEntry.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs text-muted-foreground hover:text-primary"
                            onClick={() => openDialog(day.dateStr, mealType)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add to Planner Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="capitalize">
              Add {dialogMealType} — {dialogDate}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {!meals || meals.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No saved meals yet. Create meals first from the Meals page.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {meals.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMealId(meal.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedMealId === meal.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{meal.name}</p>
                        {meal.description && (
                          <p className="text-xs text-muted-foreground">{meal.description}</p>
                        )}
                      </div>
                      <span className="text-primary font-semibold text-sm ml-2">
                        {meal.totalCalories} kcal
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!selectedMealId || createEntry.isPending || !meals?.length}
            >
              {createEntry.isPending ? "Adding..." : "Add to Planner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
