import { useState } from "react";
import { format } from "date-fns";
import { 
  useListFoodLogs, 
  getListFoodLogsQueryKey,
  useDeleteFoodLog
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;

export default function Log() {
  const [date, setDate] = useState<Date>(new Date());
  const dateStr = format(date, "yyyy-MM-dd");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: logs, isLoading } = useListFoodLogs(
    { date: dateStr },
    { query: { queryKey: getListFoodLogsQueryKey({ date: dateStr }) } }
  );

  const deleteLog = useDeleteFoodLog({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFoodLogsQueryKey({ date: dateStr }) });
        toast({ title: "Entry deleted" });
      }
    }
  });

  const handleDelete = (id: number) => {
    deleteLog.mutate({ id });
  };

  const groupedLogs = mealTypes.reduce((acc, type) => {
    acc[type] = logs?.filter(log => log.mealType === type) || [];
    return acc;
  }, {} as Record<string, typeof logs>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Food Log</h1>
          <p className="text-muted-foreground mt-1">Track your meals for the day.</p>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          mealTypes.map((mealType) => {
            const mealLogs = groupedLogs[mealType] || [];
            const totalCalories = mealLogs.reduce((sum, log) => sum + log.calories, 0);

            return (
              <Card key={mealType} className="shadow-sm border-muted">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="capitalize text-xl">{mealType}</CardTitle>
                    <CardDescription>{totalCalories} kcal</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1">
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
                        <div key={log.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors group">
                          <div>
                            <p className="font-medium text-sm">
                              {log.food?.name || log.customFoodName}
                              <span className="text-muted-foreground font-normal ml-2">
                                {log.quantity} {log.food?.servingUnit || 'serving'}
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
                            onClick={() => handleDelete(log.id)}
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
          })
        )}
      </div>
    </div>
  );
}
