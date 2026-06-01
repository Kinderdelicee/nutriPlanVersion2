import { useState } from "react";
import { 
  useListFoods, 
  getListFoodsQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Foods() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Simple debounce
  useState(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: foods, isLoading } = useListFoods(
    { search: debouncedSearch, limit: 50 },
    { query: { queryKey: getListFoodsQueryKey({ search: debouncedSearch, limit: 50 }) } }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Foods</h1>
          <p className="text-muted-foreground mt-1">Browse and search the food database.</p>
        </div>
        <Button>
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
            <p>No foods found matching "{search}"</p>
          </div>
        ) : (
          foods?.map((food) => (
            <Card key={food.id} className="hover-elevate cursor-pointer">
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
    </div>
  );
}
