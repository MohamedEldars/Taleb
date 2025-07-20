import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts/user", user?.id],
    enabled: !!user?.id,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "غير مخول",
        description: "تم تسجيل الخروج. جارٍ تسجيل الدخول مرة أخرى...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gradient-to-br from-primary to-secondary h-48"></div>
        <div className="p-4 space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-neutral-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userStats = {
    posts: userPosts?.length || 0,
    likes: userPosts?.reduce((total: number, post: any) => total + (post.likesCount || 0), 0) || 0,
    comments: userPosts?.reduce((total: number, post: any) => total + (post.commentsCount || 0), 0) || 0,
  };

  return (
    <div className="pb-20" dir="rtl">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <img 
            src={user.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
            alt="My profile" 
            className="w-20 h-20 rounded-full object-cover border-4 border-white"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-primary-100">{user.grade || "طالب"}</p>
            <p className="text-primary-200 text-sm">{user.school || "مدرسة الشارقة الثانوية"}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-around bg-white/20 rounded-lg p-3">
          <div className="text-center">
            <p className="font-bold text-lg">{userStats.posts}</p>
            <p className="text-xs text-primary-100">منشور</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{userStats.likes}</p>
            <p className="text-xs text-primary-100">إعجاب</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{userStats.comments}</p>
            <p className="text-xs text-primary-100">تعليق</p>
          </div>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="p-4 bg-white border-b border-neutral-200">
        <div className="flex space-x-3">
          <Button className="flex-1 bg-primary text-white hover:bg-primary/90">
            تعديل الملف الشخصي
          </Button>
          <Button variant="outline" size="icon">
            <i className="fas fa-cog"></i>
          </Button>
        </div>
      </div>

      {/* My Posts */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-neutral-800 mb-4">منشوراتي</h3>
        
        {postsLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-neutral-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : userPosts && userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {userPosts.map((post: any) => (
              <div key={post.id} className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                {post.attachments && post.attachments.length > 0 ? (
                  post.type === 'pdf' ? (
                    <div className="w-full h-full bg-red-50 flex items-center justify-center">
                      <i className="fas fa-file-pdf text-red-500 text-2xl"></i>
                    </div>
                  ) : (
                    <img 
                      src={`/uploads/${post.attachments[0]}`} 
                      alt="Post content" 
                      className="w-full h-full object-cover"
                    />
                  )
                ) : post.type === 'question' ? (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                    <i className="fas fa-question-circle text-blue-500 text-2xl"></i>
                  </div>
                ) : (
                  <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                    <i className="fas fa-file-text text-neutral-500 text-xl"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-neutral-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-plus text-2xl text-neutral-500"></i>
              </div>
              <h3 className="font-bold text-neutral-800 mb-2">لم تنشر أي محتوى بعد</h3>
              <p className="text-neutral-600">ابدأ بمشاركة أفكارك ومواردك التعليمية</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
