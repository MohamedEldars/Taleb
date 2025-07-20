import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { useState, useEffect } from "react";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === 'admin',
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/admin/reports"],
    enabled: !!user && user.role === 'admin',
  });

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      toast({
        title: "غير مخول",
        description: "ليس لديك صلاحية للوصول إلى هذه الصفحة",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const resolveReportMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/reports/${reportId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "تم حل التقرير",
        description: "تم تحديث حالة التقرير بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
        description: "حدث خطأ أثناء حل التقرير",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 h-32"></div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-neutral-200 rounded-lg h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="pb-20" dir="rtl">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-accent rounded-full w-12 h-12 flex items-center justify-center">
            <i className="fas fa-user-shield text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">لوحة الإدارة</h2>
            <p className="text-neutral-300 text-sm">إدارة المحتوى والموارد التعليمية</p>
          </div>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="p-4 bg-white border-b border-neutral-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-primary/10 rounded-lg p-3">
              <i className="fas fa-users text-primary text-xl mb-2"></i>
              <p className="font-bold text-lg">{stats?.totalStudents || 0}</p>
              <p className="text-xs text-neutral-500">طالب نشط</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-secondary/10 rounded-lg p-3">
              <i className="fas fa-file-alt text-secondary text-xl mb-2"></i>
              <p className="font-bold text-lg">{stats?.totalPosts || 0}</p>
              <p className="text-xs text-neutral-500">منشور</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-accent/10 rounded-lg p-3">
              <i className="fas fa-flag text-accent text-xl mb-2"></i>
              <p className="font-bold text-lg">{stats?.reportedPosts || 0}</p>
              <p className="text-xs text-neutral-500">تقرير</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="p-4 space-y-4">
        
        {/* Upload School Resources */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-800 mb-3 flex items-center space-x-2">
              <i className="fas fa-upload text-primary"></i>
              <span>رفع الموارد التعليمية</span>
            </h3>
            
            <FileUpload files={files} onFilesChange={setFiles} />
            
            <Button className="w-full bg-primary text-white mt-3 hover:bg-primary/90">
              رفع الملفات
            </Button>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-800 mb-3 flex items-center space-x-2">
              <i className="fas fa-flag text-accent"></i>
              <span>التقارير الأخيرة</span>
            </h3>
            
            <div className="space-y-3">
              {reports && reports.length > 0 ? (
                reports.map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-exclamation text-accent text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{report.reason}</p>
                        <p className="text-xs text-neutral-500">تم الإبلاغ بواسطة: {report.reporter.firstName} {report.reporter.lastName}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => resolveReportMutation.mutate({ reportId: report.id, status: "resolved" })}
                        disabled={resolveReportMutation.isPending}
                      >
                        حذف
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveReportMutation.mutate({ reportId: report.id, status: "dismissed" })}
                        disabled={resolveReportMutation.isPending}
                      >
                        تجاهل
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <i className="fas fa-check-circle text-4xl text-secondary mb-2"></i>
                  <p className="text-neutral-600">لا توجد تقارير معلقة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-800 mb-3 flex items-center space-x-2">
              <i className="fas fa-users-cog text-secondary"></i>
              <span>إدارة المستخدمين</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center justify-center space-x-2 py-3">
                <i className="fas fa-user-plus"></i>
                <span className="text-sm">إضافة طالب</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center space-x-2 py-3">
                <i className="fas fa-list"></i>
                <span className="text-sm">قائمة الطلاب</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
