import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import NavBar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedAvatar, setEditedAvatar] = useState(user.avatarUrl || "");

  const updateProfileMutation = useMutation({
    mutationFn: async ({ avatarUrl, name }: { avatarUrl: string; name: string }) => {
      if (!user) throw new Error("User not authenticated");

      const response = await apiRequest("PUT", `/api/users/${user.id}`, {
        name,
        avatarUrl,
      });

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "הפרופיל עודכן",
        description: "הפרטים נשמרו בהצלחה",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בעדכון הפרופיל",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleImageChange = (imageBase64: string) => {
    setEditedAvatar(imageBase64);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">פרופיל משתמש</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">מידע אישי וחשבון</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">שם מלא</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                  ) : (
                    user.name
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">כתובת אימייל</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.email}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">שם משתמש</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.username}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">תמונת פרופיל</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <div className="flex flex-col">
                      <ImageUpload
                        currentImage={user.avatarUrl}
                        onImageChange={handleImageChange}
                      />

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={updateProfileMutation.isPending}
                        >
                          ביטול
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {user.avatarUrl ? (
                        <img
                          className="h-16 w-16 rounded-full object-cover"
                          src={user.avatarUrl}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-semibold">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-left sm:px-6 flex gap-2 justify-between">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={updateProfileMutation.isPending}
                >
                  ביטול
                </Button>

                <Button
                  onClick={() => updateProfileMutation.mutate({ avatarUrl: editedAvatar, name: editedName })}
                  disabled={
                    updateProfileMutation.isPending ||
                    (editedName === user.name && editedAvatar === (user.avatarUrl || ""))
                  }
                >
                  {updateProfileMutation.isPending ? "שומר..." : "שמור שינויים"}
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="mr-4"
                  onClick={() => {
                    setEditedName(user.name);
                    setEditedAvatar(user.avatarUrl || "");
                    setIsEditing(true);
                  }}
                >
                  ערוך
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "מתנתק..." : "התנתק"}
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
