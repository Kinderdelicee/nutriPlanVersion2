import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { 
  useListMealPlans, 
  getListMealPlansQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Planner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
  
  const { data: mealPlans, isLoading } = useListMealPlans(
    { weekStart },
    { query: { queryKey: getListMealPlansQueryKey({ weekStart }) } }
  );

  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(new Date(weekStart), i);
    return {
      date,
      dateStr: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE"),
      dayNum: format(date, "d")
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
          <span className="text-sm font-medium w-32 text-center">
            {format(new Date(weekStart), "MMM d")} - {format(addDays(new Date(weekStart), 6), "MMM d, yyyy")}
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
            <Card key={day.dateStr} className={`h-full min-h-[500px] flex flex-col ${isToday ? 'border-primary ring-1 ring-primary/20' : ''}`}>
              <CardHeader className="pb-3 text-center border-b bg-muted/20">
                <CardTitle className="text-sm font-normal text-muted-foreground uppercase tracking-wider">{day.dayName}</CardTitle>
                <div className={`text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>{day.dayNum}</div>
              </CardHeader>
              <CardContent className="flex-1 p-2 space-y-2 overflow-y-auto mt-2">
                {isLoading ? (
                  <Skeleton className="h-20 w-full rounded-md" />
                ) : (
                  <>
                    {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
                      const entry = mealPlans?.find(p => p.date === day.dateStr && p.mealType === mealType);
                      return (
                        <div key={mealType} className="border rounded-md p-2 bg-card">
                          <div className="text-xs font-medium capitalize text-muted-foreground mb-1">{mealType}</div>
                          {entry ? (
                            <div className="text-sm font-semibold truncate" title={entry.meal?.name}>
                              {entry.meal?.name}
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-muted-foreground hover:text-primary">
                              <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
