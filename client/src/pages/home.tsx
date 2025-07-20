import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="pb-20" dir="rtl">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
        <h2 className="text-xl font-bold mb-2">مرحباً بك في مجتمع طالب</h2>
        <p className="text-primary-100">شارك أفكارك واكتشف محتوى زملائك</p>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <Link href="/upload">
            <div className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform">
                <i className="fas fa-plus text-xl"></i>
              </div>
              <span className="text-xs text-neutral-600 font-medium">أضف منشور</span>
            </div>
          </Link>
          
          {user && (
            <div className="flex flex-col items-center space-y-2 flex-shrink-0">
              <img 
                src={user.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                alt="My profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-secondary"
              />
              <span className="text-xs text-neutral-600 font-medium">{user.firstName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4 px-4">
        {posts && posts.length > 0 ? (
          posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-neutral-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-comments text-2xl text-neutral-500"></i>
              </div>
              <h3 className="font-bold text-neutral-800 mb-2">لا توجد منشورات بعد</h3>
              <p className="text-neutral-600 mb-4">كن أول من يشارك محتوى في المجتمع!</p>
              <Link href="/upload">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  إنشاء منشور جديد
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
