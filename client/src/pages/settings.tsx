import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState("ar");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [privacy, setPrivacy] = useState("public");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Redirecting to login...",
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
      <div className="animate-pulse p-4 space-y-4">
        <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-neutral-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSave = () => {
    toast({
      title: language === "ar" ? "تم الحفظ" : "Settings Saved",
      description: language === "ar" ? "تم حفظ الإعدادات بنجاح" : "Your settings have been saved successfully",
    });
  };

  const isRTL = language === "ar";

  return (
    <div className="pb-20 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Settings Header */}
      <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center">
            <i className="fas fa-cog text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {isRTL ? "الإعدادات" : "Settings"}
            </h2>
            <p className="text-neutral-300 text-sm">
              {isRTL ? "إدارة تفضيلات حسابك" : "Manage your account preferences"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Language & Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-palette text-primary"></i>
              {isRTL ? "المظهر واللغة" : "Appearance & Language"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? "اللغة" : "Language"}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">
                    <div className="flex items-center gap-2">
                      <span>🇸🇦</span>
                      <span>العربية</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span>🇺🇸</span>
                      <span>English</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? "المظهر" : "Theme"}</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-sun text-yellow-500"></i>
                      <span>{isRTL ? "فاتح" : "Light"}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-moon text-blue-500"></i>
                      <span>{isRTL ? "داكن" : "Dark"}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-adjust text-neutral-500"></i>
                      <span>{isRTL ? "تلقائي" : "Auto"}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-bell text-primary"></i>
              {isRTL ? "الإشعارات" : "Notifications"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{isRTL ? "إشعارات التطبيق" : "App Notifications"}</Label>
                <p className="text-sm text-neutral-500">
                  {isRTL ? "تلقي إشعارات عن التفاعلات الجديدة" : "Receive notifications for new interactions"}
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>{isRTL ? "إشعارات البريد الإلكتروني" : "Email Notifications"}</Label>
                <p className="text-sm text-neutral-500">
                  {isRTL ? "تلقي ملخص أسبوعي على الإيميل" : "Receive weekly digest via email"}
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-shield-alt text-primary"></i>
              {isRTL ? "الخصوصية" : "Privacy"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? "رؤية الملف الشخصي" : "Profile Visibility"}</Label>
              <Select value={privacy} onValueChange={setPrivacy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-globe text-green-500"></i>
                      <span>{isRTL ? "عام" : "Public"}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="school">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-school text-blue-500"></i>
                      <span>{isRTL ? "المدرسة فقط" : "School Only"}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-lock text-red-500"></i>
                      <span>{isRTL ? "خاص" : "Private"}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-user-cog text-primary"></i>
              {isRTL ? "إدارة الحساب" : "Account Management"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <i className="fas fa-download"></i>
              {isRTL ? "تحميل بياناتي" : "Download My Data"}
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-2">
              <i className="fas fa-key"></i>
              {isRTL ? "تغيير كلمة المرور" : "Change Password"}
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-2 text-red-600 hover:text-red-700">
              <i className="fas fa-trash"></i>
              {isRTL ? "حذف الحساب" : "Delete Account"}
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full bg-primary text-white py-3 text-lg font-medium"
        >
          {isRTL ? "حفظ الإعدادات" : "Save Settings"}
        </Button>

        {/* App Info */}
        <Card>
          <CardContent className="p-4 text-center text-sm text-neutral-500">
            <p>Taleb Student Hub v1.0.0</p>
            <p className="mt-1">
              {isRTL ? "© 2024 جميع الحقوق محفوظة" : "© 2024 All rights reserved"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}