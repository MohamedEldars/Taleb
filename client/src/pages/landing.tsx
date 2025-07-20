import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">طالب</h1>
            <p className="text-xl text-neutral-600 font-medium">Taleb</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-3">
                مرحباً بك في مجتمع طالب
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                منصة اجتماعية تعليمية حديثة لطلاب المدارس الثانوية. شارك أفكارك، اكتشف محتوى زملائك، وتعلم معاً.
              </p>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="bg-primary/10 rounded-lg p-3 mb-2">
                    <i className="fas fa-users text-primary text-xl"></i>
                  </div>
                  <p className="text-xs text-neutral-600">تواصل مع الزملاء</p>
                </div>
                <div>
                  <div className="bg-secondary/10 rounded-lg p-3 mb-2">
                    <i className="fas fa-book text-secondary text-xl"></i>
                  </div>
                  <p className="text-xs text-neutral-600">شارك الموارد</p>
                </div>
                <div>
                  <div className="bg-accent/10 rounded-lg p-3 mb-2">
                    <i className="fas fa-question-circle text-accent text-xl"></i>
                  </div>
                  <p className="text-xs text-neutral-600">اطرح الأسئلة</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium text-lg transition-all duration-300 hover:scale-105"
            >
              دخول إلى المنصة
            </Button>
            
            <p className="text-xs text-neutral-500">
              بالدخول إلى المنصة، أنت توافق على شروط الاستخدام وسياسة الخصوصية
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
