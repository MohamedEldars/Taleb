import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertPostSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/FileUpload";
import { useLocation } from "wouter";

const subjects = [
  "رياضيات",
  "فيزياء", 
  "كيمياء",
  "أحياء",
  "عربي",
  "إنجليزي",
  "تاريخ",
  "جغرافيا"
];

export default function Upload() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<string>("text");

  const form = useForm({
    resolver: zodResolver(insertPostSchema.extend({
      subject: insertPostSchema.shape.subject.optional(),
      privacy: insertPostSchema.shape.privacy.optional(),
    })),
    defaultValues: {
      content: "",
      subject: "",
      type: "text",
      privacy: "public",
    },
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

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append("content", data.content);
      formData.append("subject", data.subject || "");
      formData.append("type", data.type);
      formData.append("privacy", data.privacy);
      
      files.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم النشر بنجاح",
        description: "تم نشر المنشور في التايم لاين",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      form.reset();
      setFiles([]);
      setLocation("/");
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
        title: "خطأ في النشر",
        description: "حدث خطأ أثناء نشر المنشور. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (!data.content.trim()) {
      toast({
        title: "حقل مطلوب",
        description: "يرجى إدخال محتوى المنشور",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate(data);
  };

  const handlePostTypeChange = (type: string) => {
    setPostType(type);
    form.setValue("type", type);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
          <div className="h-32 bg-neutral-200 rounded"></div>
          <div className="h-20 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20" dir="rtl">
      {/* Upload Header */}
      <div className="p-4 border-b border-neutral-200 bg-white">
        <h2 className="text-xl font-bold text-neutral-800 text-center">إنشاء منشور جديد</h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
        {/* Text Content */}
        <div>
          <Label className="block text-sm font-medium text-neutral-700 mb-2">محتوى المنشور</Label>
          <Textarea 
            {...form.register("content")}
            placeholder="شارك أفكارك أو اطرح سؤالاً أو شارك مصادر تعليمية..."
            className="w-full h-32 p-3 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* File Upload */}
        <FileUpload files={files} onFilesChange={setFiles} />

        {/* Post Type Options */}
        <div>
          <Label className="block text-sm font-medium text-neutral-700 mb-3">نوع المنشور</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={postType === "text" ? "default" : "outline"}
              className="flex items-center justify-center gap-2 py-4 text-center"
              onClick={() => handlePostTypeChange("text")}
            >
              <i className="fas fa-align-right text-lg"></i>
              <span className="font-medium">نص</span>
            </Button>
            <Button
              type="button"
              variant={postType === "image" ? "default" : "outline"}
              className="flex items-center justify-center gap-2 py-4 text-center"
              onClick={() => handlePostTypeChange("image")}
            >
              <i className="fas fa-image text-lg"></i>
              <span className="font-medium">صورة</span>
            </Button>
            <Button
              type="button"
              variant={postType === "pdf" ? "default" : "outline"}
              className="flex items-center justify-center gap-2 py-4 text-center"
              onClick={() => handlePostTypeChange("pdf")}
            >
              <i className="fas fa-file-pdf text-lg"></i>
              <span className="font-medium">ملف PDF</span>
            </Button>
            <Button
              type="button"
              variant={postType === "question" ? "default" : "outline"}
              className="flex items-center justify-center gap-2 py-4 text-center"
              onClick={() => handlePostTypeChange("question")}
            >
              <i className="fas fa-question-circle text-lg"></i>
              <span className="font-medium">سؤال</span>
            </Button>
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <Label className="block text-sm font-medium text-neutral-700 mb-2">المادة الدراسية</Label>
          <Select onValueChange={(value) => form.setValue("subject", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر المادة" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Privacy Settings */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-neutral-700 mb-3">إعدادات الخصوصية</h4>
            <RadioGroup 
              defaultValue="public" 
              onValueChange={(value) => form.setValue("privacy", value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="text-sm text-neutral-600">
                  عام - يمكن لجميع الطلاب رؤيته
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="class" id="class" />
                <Label htmlFor="class" className="text-sm text-neutral-600">
                  الصف فقط - طلاب صفي فقط
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button 
            type="submit" 
            disabled={createPostMutation.isPending}
            className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-all"
          >
            {createPostMutation.isPending ? "جارٍ النشر..." : "نشر المحتوى"}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            className="px-6 py-3 border border-neutral-300 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-all"
          >
            مسودة
          </Button>
        </div>
      </form>
    </div>
  );
}
