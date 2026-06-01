import { format } from "date-fns";
import { Link } from "wouter";
import { 
  useGetDashboardSummary, 
  useGetStreak,
  useGetMe,
  getGetMeQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Flame, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  
  const { data: user } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey()
    }
  });

  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary(
    { date: today },
    { query: { queryKey: getGetDashboardSummaryQueryKey({ date: today }) } }
  );

  const { data: streak } = useGetStreak();

  const getCalorieColorClass = (percentage: number) => {
    if (percentage < 80) return "text-primary";
    if (percentage <= 100) return "text-yellow-500";
    return "text-destructive";
  };

  const getProgressColorClass = (percentage: number) => {
    if (percentage < 80) return "bg-primary";
    if (percentage <= 100) return "bg-yellow-500";
    return "bg-destructive";
  };

  if (isLoadingSummary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl md:col-span-2" />
        </div>
      </div>
    );
  }

  const calPercentage = summary?.caloriePercentage || 0;
  const remainingCals = summary?.remaining?.calories || 0;
  const totals = summary?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goals = summary?.goals || { calories: 2000, protein: 150, carbs: 200, fat: 65 };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Happy {format(new Date(), 'EEEE')}, {user?.name?.split(' ')[0] || 'there'}!</h1>
          <p className="text-muted-foreground mt-1">Here's your nutrition overview for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-orange-500/10 text-orange-600 px-4 py-2 rounded-full font-medium">
            <Flame className="w-5 h-5" />
            <span>{streak?.currentStreak || 0} Day Streak</span>
          </div>
          <Link href="/log">
            <Button className="rounded-full shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Quick Log
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calories Card */}
        <Card className="shadow-sm border-muted md:col-span-1 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Target className="w-32 h-32" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle>Calories</CardTitle>
            <CardDescription>Daily goal: {goals.calories} kcal</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-muted fill-none"
                  strokeWidth="12"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className={cn(
                    "fill-none transition-all duration-1000 ease-in-out",
                    calPercentage < 80 ? "stroke-primary" : calPercentage <= 100 ? "stroke-yellow-500" : "stroke-destructive"
                  )}
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - Math.min(calPercentage, 100) / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={cn("text-4xl font-bold tracking-tighter", getCalorieColorClass(calPercentage))}>
                  {totals.calories}
                </span>
                <span className="text-sm text-muted-foreground mt-1">eaten</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm font-medium">
                {remainingCals > 0 
                  ? <><span className="text-foreground font-bold">{remainingCals}</span> kcal remaining</>
                  : <span className="text-destructive font-bold">{Math.abs(remainingCals)} kcal over goal</span>
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Macros Card */}
        <Card className="shadow-sm border-muted md:col-span-2">
          <CardHeader>
            <CardTitle>Macronutrients</CardTitle>
            <CardDescription>Your daily intake breakdown</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Protein
                </span>
                <span className="text-muted-foreground">{totals.protein}g / {goals.protein}g</span>
              </div>
              <Progress value={Math.min((totals.protein / (goals.protein || 1)) * 100, 100)} className="h-2" indicatorClassName="bg-blue-500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  Carbs
                </span>
                <span className="text-muted-foreground">{totals.carbs}g / {goals.carbs}g</span>
              </div>
              <Progress value={Math.min((totals.carbs / (goals.carbs || 1)) * 100, 100)} className="h-2" indicatorClassName="bg-orange-500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  Fat
                </span>
                <span className="text-muted-foreground">{totals.fat}g / {goals.fat}g</span>
              </div>
              <Progress value={Math.min((totals.fat / (goals.fat || 1)) * 100, 100)} className="h-2" indicatorClassName="bg-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary?.mealBreakdown?.map((meal) => (
          <Link key={meal.mealType} href={`/log?mealType=${meal.mealType}`}>
            <Card className="hover-elevate cursor-pointer border-muted shadow-sm transition-all group">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize text-lg">{meal.mealType}</h3>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <div className="text-2xl font-bold text-primary">{meal.calories} <span className="text-sm font-normal text-muted-foreground">kcal</span></div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>P: {meal.protein}g</span>
                  <span>C: {meal.carbs}g</span>
                  <span>F: {meal.fat}g</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
