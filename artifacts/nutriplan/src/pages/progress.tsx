import { useState } from "react";
import { format, subDays, startOfWeek } from "date-fns";
import { 
  useGetNutritionProgress, 
  getGetNutritionProgressQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

export default function Progress() {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: progressData, isLoading } = useGetNutritionProgress(
    { period, endDate: today },
    { query: { queryKey: getGetNutritionProgressQueryKey({ period, endDate: today }) } }
  );

  const formatXAxis = (tickItem: string) => {
    return format(new Date(tickItem), period === 'week' ? 'EEE' : 'MMM d');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
          <p className="text-muted-foreground mt-1">Visualize your nutrition history.</p>
        </div>
        <div className="w-40">
          <Select value={period} onValueChange={(v: "week" | "month") => setPeriod(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calorie Intake</CardTitle>
            <CardDescription>Daily calories consumed vs goal</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : progressData && progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="calories" name="Consumed" stroke="hsl(var(--primary))" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="goalCalories" name="Goal" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                No data available for this period.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Macros Breakdown</CardTitle>
            <CardDescription>Daily protein, carbs, and fat</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : progressData && progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Bar dataKey="protein" name="Protein (g)" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="carbs" name="Carbs (g)" stackId="a" fill="#f97316" />
                  <Bar dataKey="fat" name="Fat (g)" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                No data available for this period.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
