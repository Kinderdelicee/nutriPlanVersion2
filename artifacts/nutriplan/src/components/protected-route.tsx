import { useAuth } from "@/components/auth-provider";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Redirect } from "wouter";

export function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { token, setToken } = useAuth();
  
  const { data: user, isError, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: getGetMeQueryKey(),
      retry: false
    }
  });

  if (!token) {
    return <Redirect to="/login" />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (isError) {
    setToken(null);
    return <Redirect to="/login" />;
  }

  if (user) {
    return <Component />;
  }

  return null;
}
