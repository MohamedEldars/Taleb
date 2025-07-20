import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الإعجاب بالمنشور",
        variant: "destructive",
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (reason: string) => {
      await apiRequest("POST", `/api/posts/${post.id}/report`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "تم الإبلاغ",
        description: "تم إرسال التقرير إلى الإدارة",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الإبلاغ عن المنشور",
        variant: "destructive",
      });
    },
  });

  const getPostTypeIcon = () => {
    switch (post.type) {
      case 'question':
        return <i className="fas fa-question-circle text-amber-600"></i>;
      case 'pdf':
        return <i className="fas fa-file-pdf text-red-500"></i>;
      case 'image':
        return <i className="fas fa-image text-blue-500"></i>;
      default:
        return null;
    }
  };

  const renderAttachment = () => {
    if (!post.attachments || post.attachments.length === 0) return null;

    const attachment = post.attachments[0];
    
    if (post.type === 'pdf') {
      return (
        <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-200 mb-3">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500 rounded p-2">
              <i className="fas fa-file-pdf text-white text-xl"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-neutral-800">{attachment}</h4>
              <p className="text-sm text-neutral-500">ملف PDF</p>
            </div>
            <Button
              size="sm"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => window.open(`/uploads/${attachment}`, '_blank')}
            >
              تحميل
            </Button>
          </div>
        </div>
      );
    }

    if (post.type === 'image') {
      return (
        <img 
          src={`/uploads/${attachment}`} 
          alt="Post attachment" 
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      );
    }

    return null;
  };

  return (
    <Card className="backdrop-blur-sm bg-white/90 border-neutral-200" dir="rtl">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <img 
            src={post.author.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50"} 
            alt={`${post.author.firstName} ${post.author.lastName}`} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-800">
              {post.author.firstName} {post.author.lastName}
            </h3>
            <p className="text-xs text-neutral-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getPostTypeIcon()}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => reportMutation.mutate("محتوى غير مناسب")}
              disabled={reportMutation.isPending}
            >
              <i className="fas fa-ellipsis-h text-neutral-400"></i>
            </Button>
          </div>
        </div>
        
        <p className="text-neutral-700 mb-3 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        
        {post.type === 'question' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <div className="flex items-center space-x-2">
              <i className="fas fa-question-circle text-amber-600"></i>
              <span className="text-amber-700 font-medium text-sm">سؤال للمناقشة</span>
            </div>
          </div>
        )}

        {renderAttachment()}
        
        <div className="flex items-center justify-between text-neutral-500">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`flex items-center space-x-1 hover:text-accent transition-colors ${
                isLiked ? 'text-accent' : ''
              }`}
            >
              <i className={isLiked ? "fas fa-heart" : "far fa-heart"}></i>
              <span className="text-sm">{likesCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <i className="far fa-comment"></i>
              <span className="text-sm">{post.commentsCount || 0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-secondary transition-colors">
              <i className="far fa-share-square"></i>
            </Button>
          </div>
          {post.subject && (
            <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{post.subject}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
