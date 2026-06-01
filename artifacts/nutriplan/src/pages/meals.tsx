import { 
  useListMeals, 
  getListMealsQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Utensils } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Meals() {
  const { data: meals, isLoading } = useListMeals(
    { query: { queryKey: getListMealsQueryKey() } }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Meals</h1>
          <p className="text-muted-foreground mt-1">Create and manage your favorite meal templates.</p>
        </div>
        <Button>
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
                <CardDescription className="line-clamp-1">{meal.description || 'No description'}</CardDescription>
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
                <Button variant="outline" className="w-full mt-6">
                  Log this meal
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
