import { 
  useGetMe,
  getGetMeQueryKey,
  useUpdateProfile
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey() }
  });

  const updateProfile = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        toast({ title: "Profile updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      }
    }
  });

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
    dailyCalorieGoal: "",
    dailyProteinGoal: "",
    dailyCarbsGoal: "",
    dailyFatGoal: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        age: user.age?.toString() || "",
        gender: user.gender || "",
        weight: user.weight?.toString() || "",
        height: user.height?.toString() || "",
        activityLevel: user.activityLevel || "",
        dailyCalorieGoal: user.dailyCalorieGoal?.toString() || "",
        dailyProteinGoal: user.dailyProteinGoal?.toString() || "",
        dailyCarbsGoal: user.dailyCarbsGoal?.toString() || "",
        dailyFatGoal: user.dailyFatGoal?.toString() || "",
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      data: {
        name: formData.name,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender || null,
        weight: formData.weight ? Number(formData.weight) : null,
        height: formData.height ? Number(formData.height) : null,
        activityLevel: formData.activityLevel || null,
        dailyCalorieGoal: formData.dailyCalorieGoal ? Number(formData.dailyCalorieGoal) : null,
        dailyProteinGoal: formData.dailyProteinGoal ? Number(formData.dailyProteinGoal) : null,
        dailyCarbsGoal: formData.dailyCarbsGoal ? Number(formData.dailyCarbsGoal) : null,
        dailyFatGoal: formData.dailyFatGoal ? Number(formData.dailyFatGoal) : null,
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and goals.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" value={formData.age} onChange={(e) => handleChange("age", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" value={formData.weight} onChange={(e) => handleChange("weight", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" value={formData.height} onChange={(e) => handleChange("height", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select value={formData.activityLevel} onValueChange={(v) => handleChange("activityLevel", v)}>
                <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Lightly Active</SelectItem>
                  <SelectItem value="moderate">Moderately Active</SelectItem>
                  <SelectItem value="very">Very Active</SelectItem>
                  <SelectItem value="extra">Extra Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutrition Goals</CardTitle>
            <CardDescription>Set your daily targets</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="dailyCalorieGoal">Daily Calories (kcal)</Label>
              <Input id="dailyCalorieGoal" type="number" value={formData.dailyCalorieGoal} onChange={(e) => handleChange("dailyCalorieGoal", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyProteinGoal">Protein (g)</Label>
              <Input id="dailyProteinGoal" type="number" value={formData.dailyProteinGoal} onChange={(e) => handleChange("dailyProteinGoal", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyCarbsGoal">Carbs (g)</Label>
              <Input id="dailyCarbsGoal" type="number" value={formData.dailyCarbsGoal} onChange={(e) => handleChange("dailyCarbsGoal", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyFatGoal">Fat (g)</Label>
              <Input id="dailyFatGoal" type="number" value={formData.dailyFatGoal} onChange={(e) => handleChange("dailyFatGoal", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
