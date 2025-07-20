import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: "posts" | "likes" | "help" | "study" | "streak";
  points: number;
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface UserStats {
  totalPoints: number;
  level: number;
  postsCount: number;
  likesReceived: number;
  helpfulAnswers: number;
  studyStreak: number;
  rank: number;
}

export default function Achievements() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 250,
    level: 3,
    postsCount: 15,
    likesReceived: 45,
    helpfulAnswers: 8,
    studyStreak: 5,
    rank: 12
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      title: "أول خطوة",
      description: "شارك أول منشور لك",
      icon: "fas fa-baby",
      category: "posts",
      points: 10,
      requirement: 1,
      currentProgress: 15,
      unlocked: true,
      unlockedAt: "2024-01-15"
    },
    {
      id: 2,
      title: "كاتب نشط",
      description: "شارك 10 منشورات",
      icon: "fas fa-pen",
      category: "posts",
      points: 50,
      requirement: 10,
      currentProgress: 15,
      unlocked: true,
      unlockedAt: "2024-01-20"
    },
    {
      id: 3,
      title: "مؤلف محترف",
      description: "شارك 25 منشور",
      icon: "fas fa-trophy",
      category: "posts",
      points: 100,
      requirement: 25,
      currentProgress: 15,
      unlocked: false
    },
    {
      id: 4,
      title: "محبوب",
      description: "احصل على 50 إعجاب",
      icon: "fas fa-heart",
      category: "likes",
      points: 75,
      requirement: 50,
      currentProgress: 45,
      unlocked: false
    },
    {
      id: 5,
      title: "مساعد مفيد",
      description: "قدم 5 إجابات مفيدة",
      icon: "fas fa-hands-helping",
      category: "help",
      points: 60,
      requirement: 5,
      currentProgress: 8,
      unlocked: true,
      unlockedAt: "2024-01-25"
    },
    {
      id: 6,
      title: "طالب مجتهد",
      description: "حافظ على سلسلة دراسة لمدة 7 أيام",
      icon: "fas fa-fire",
      category: "streak",
      points: 40,
      requirement: 7,
      currentProgress: 5,
      unlocked: false
    },
    {
      id: 7,
      title: "عالم صغير",
      description: "انشر في 3 مواد مختلفة",
      icon: "fas fa-graduation-cap",
      category: "study",
      points: 30,
      requirement: 3,
      currentProgress: 2,
      unlocked: false
    }
  ]);

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "posts": return "text-blue-600 bg-blue-100";
      case "likes": return "text-red-600 bg-red-100";
      case "help": return "text-green-600 bg-green-100";
      case "study": return "text-purple-600 bg-purple-100";
      case "streak": return "text-orange-600 bg-orange-100";
      default: return "text-neutral-600 bg-neutral-100";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "posts": return "المنشورات";
      case "likes": return "الإعجابات";
      case "help": return "المساعدة";
      case "study": return "الدراسة";
      case "streak": return "الانتظام";
      default: return category;
    }
  };

  const getPointsToNextLevel = () => {
    const pointsPerLevel = 100;
    const currentLevelPoints = (userStats.level - 1) * pointsPerLevel;
    const nextLevelPoints = userStats.level * pointsPerLevel;
    return nextLevelPoints - userStats.totalPoints;
  };

  const getLevelProgress = () => {
    const pointsPerLevel = 100;
    const currentLevelPoints = (userStats.level - 1) * pointsPerLevel;
    const pointsInCurrentLevel = userStats.totalPoints - currentLevelPoints;
    return (pointsInCurrentLevel / pointsPerLevel) * 100;
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="pb-20 space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">الإنجازات والنقاط</h2>
            <p className="text-yellow-100">تابع تقدمك واحصل على المكافآت</p>
          </div>
          <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center">
            <i className="fas fa-medal text-2xl"></i>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>إحصائياتك</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                المرتبة #{userStats.rank}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Level Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">المستوى {userStats.level}</span>
                <span className="text-xs text-neutral-500">
                  {getPointsToNextLevel()} نقطة للمستوى التالي
                </span>
              </div>
              <Progress value={getLevelProgress()} className="h-3" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalPoints}</div>
                <div className="text-sm text-neutral-600">النقاط الكلية</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userStats.postsCount}</div>
                <div className="text-sm text-neutral-600">المنشورات</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{userStats.likesReceived}</div>
                <div className="text-sm text-neutral-600">الإعجابات</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{userStats.studyStreak}</div>
                <div className="text-sm text-neutral-600">أيام متتالية</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unlocked Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-unlock text-green-600"></i>
              الإنجازات المحققة ({unlockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unlockedAchievements.map(achievement => (
              <div key={achievement.id} className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <i className={`${achievement.icon} text-green-600 text-lg`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-800">{achievement.title}</h4>
                  <p className="text-sm text-green-700">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      تم الإنجاز في {new Date(achievement.unlockedAt).toLocaleDateString('ar-EG')}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <Badge className="bg-green-600 text-white">
                    +{achievement.points} نقطة
                  </Badge>
                  <Badge variant="outline" className={`block mt-1 text-xs ${getCategoryColor(achievement.category)}`}>
                    {getCategoryLabel(achievement.category)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Locked Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-lock text-neutral-500"></i>
              الإنجازات القادمة ({lockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lockedAchievements.map(achievement => (
              <div key={achievement.id} className="flex items-center gap-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <div className="bg-neutral-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <i className={`${achievement.icon} text-neutral-500 text-lg`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-700">{achievement.title}</h4>
                  <p className="text-sm text-neutral-600">{achievement.description}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                      <span>التقدم: {achievement.currentProgress}/{achievement.requirement}</span>
                      <span>{Math.round((achievement.currentProgress / achievement.requirement) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(achievement.currentProgress / achievement.requirement) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-neutral-600">
                    +{achievement.points} نقطة
                  </Badge>
                  <Badge variant="outline" className={`block mt-1 text-xs ${getCategoryColor(achievement.category)}`}>
                    {getCategoryLabel(achievement.category)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-lightbulb text-yellow-500"></i>
              نصائح لكسب المزيد من النقاط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <i className="fas fa-edit text-blue-500 mt-1"></i>
                <div>
                  <h5 className="font-medium">شارك منشورات مفيدة</h5>
                  <p className="text-sm text-neutral-600">كل منشور يحصل على 5 نقاط</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-question-circle text-green-500 mt-1"></i>
                <div>
                  <h5 className="font-medium">ساعد زملائك</h5>
                  <p className="text-sm text-neutral-600">الإجابة على الأسئلة تمنحك 10 نقاط</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-calendar-check text-purple-500 mt-1"></i>
                <div>
                  <h5 className="font-medium">كن منتظماً</h5>
                  <p className="text-sm text-neutral-600">ادخل يومياً للحصول على نقاط إضافية</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}