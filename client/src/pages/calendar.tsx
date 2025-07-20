import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CalendarEvent {
  id: number;
  title: string;
  type: "exam" | "assignment" | "quiz" | "project";
  subject: string;
  date: string;
  time?: string;
  description?: string;
  priority: "low" | "medium" | "high";
}

export default function Calendar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 1,
      title: "امتحان الرياضيات - الجبر",
      type: "exam",
      subject: "الرياضيات",
      date: "2024-02-15",
      time: "09:00",
      description: "امتحان شامل على وحدة الجبر والمعادلات",
      priority: "high"
    },
    {
      id: 2,
      title: "واجب الفيزياء - قوانين نيوتن",
      type: "assignment",
      subject: "الفيزياء",
      date: "2024-02-10",
      description: "حل المسائل من صفحة 45-50",
      priority: "medium"
    },
    {
      id: 3,
      title: "مشروع الأحياء",
      type: "project",
      subject: "الأحياء",
      date: "2024-02-20",
      description: "بحث عن الخلايا الجذعية",
      priority: "high"
    }
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "assignment" as const,
    subject: "",
    date: "",
    time: "",
    description: "",
    priority: "medium" as const
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "غير مصرح",
        description: "تم تسجيل خروجك. جاري إعادة التوجيه...",
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

  const getEventIcon = (type: string) => {
    switch (type) {
      case "exam": return "fas fa-clipboard-check text-red-500";
      case "assignment": return "fas fa-tasks text-blue-500";
      case "quiz": return "fas fa-question-circle text-yellow-500";
      case "project": return "fas fa-lightbulb text-green-500";
      default: return "fas fa-calendar text-neutral-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500 bg-red-50";
      case "medium": return "border-l-yellow-500 bg-yellow-50";
      case "low": return "border-l-green-500 bg-green-50";
      default: return "border-l-neutral-500 bg-neutral-50";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "exam": return "امتحان";
      case "assignment": return "واجب";
      case "quiz": return "اختبار";
      case "project": return "مشروع";
      default: return type;
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "منتهي";
    if (diffDays === 0) return "اليوم";
    if (diffDays === 1) return "غداً";
    return `بعد ${diffDays} أيام`;
  };

  const todayEvents = events.filter(event => event.date === selectedDate);
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.subject || !newEvent.date) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const event: CalendarEvent = {
      id: Date.now(),
      ...newEvent
    };

    setEvents([...events, event]);
    setNewEvent({
      title: "",
      type: "assignment",
      subject: "",
      date: "",
      time: "",
      description: "",
      priority: "medium"
    });
    setShowAddDialog(false);
    
    toast({
      title: "تم الحفظ",
      description: "تم إضافة الحدث بنجاح",
    });
  };

  return (
    <div className="pb-20 space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">التقويم الدراسي</h2>
            <p className="text-blue-100">نظم مواعيدك الدراسية وامتحاناتك</p>
          </div>
          <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center">
            <i className="fas fa-calendar-alt text-2xl"></i>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {events.filter(e => e.type === "exam" && new Date(e.date) >= new Date()).length}
              </div>
              <div className="text-sm text-neutral-600">امتحانات قادمة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {events.filter(e => e.type === "assignment" && new Date(e.date) >= new Date()).length}
              </div>
              <div className="text-sm text-neutral-600">واجبات معلقة</div>
            </CardContent>
          </Card>
        </div>

        {/* Date Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>اختر التاريخ</span>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <i className="fas fa-plus mr-2"></i>
                    إضافة حدث
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إضافة حدث جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>العنوان</Label>
                      <Input
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        placeholder="مثال: امتحان الرياضيات"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>النوع</Label>
                        <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent({...newEvent, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exam">امتحان</SelectItem>
                            <SelectItem value="assignment">واجب</SelectItem>
                            <SelectItem value="quiz">اختبار</SelectItem>
                            <SelectItem value="project">مشروع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>الأولوية</Label>
                        <Select value={newEvent.priority} onValueChange={(value: any) => setNewEvent({...newEvent, priority: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">عالية</SelectItem>
                            <SelectItem value="medium">متوسطة</SelectItem>
                            <SelectItem value="low">منخفضة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>المادة</Label>
                      <Input
                        value={newEvent.subject}
                        onChange={(e) => setNewEvent({...newEvent, subject: e.target.value})}
                        placeholder="مثال: الرياضيات"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>التاريخ</Label>
                        <Input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label>الوقت (اختياري)</Label>
                        <Input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>الوصف (اختياري)</Label>
                      <Textarea
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                        placeholder="تفاصيل إضافية..."
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleAddEvent} className="w-full">
                      إضافة الحدث
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Today's Events */}
        {todayEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>أحداث اليوم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayEvents.map(event => (
                <div key={event.id} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(event.priority)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className={getEventIcon(event.type)}></i>
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-neutral-600">{event.subject}</p>
                      </div>
                    </div>
                    {event.time && (
                      <span className="text-sm font-medium text-blue-600">{event.time}</span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-neutral-600 mt-2">{event.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>الأحداث القادمة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.slice(0, 10).map(event => (
              <div key={event.id} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(event.priority)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className={getEventIcon(event.type)}></i>
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-neutral-600">{event.subject}</p>
                      <p className="text-xs text-neutral-500">{event.date} {event.time && `- ${event.time}`}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium text-blue-600">{getDaysUntil(event.date)}</span>
                    <p className="text-xs text-neutral-500">{getTypeLabel(event.type)}</p>
                  </div>
                </div>
                {event.description && (
                  <p className="text-sm text-neutral-600 mt-2">{event.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}