import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", icon: "fas fa-home", label: "الرئيسية", page: "home" },
  { path: "/profile", icon: "fas fa-user", label: "ملفي", page: "profile" },
  { path: "/upload", icon: "fas fa-plus", label: "إنشاء", page: "upload", isFloating: true },
  { path: "/admin", icon: "fas fa-cog", label: "إدارة", page: "admin" },
  { path: "/notifications", icon: "fas fa-bell", label: "إشعارات", page: "notifications" },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white border-t border-neutral-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="sm"
            onClick={() => setLocation(item.path)}
            className={`
              flex flex-col items-center space-y-1 py-2 px-3 transition-all duration-200
              ${item.isFloating 
                ? "bg-primary text-white rounded-full w-12 h-12 -mt-2 hover:bg-primary/90 hover:scale-105 shadow-lg" 
                : location === item.path 
                  ? "text-primary" 
                  : "text-neutral-400 hover:text-primary"
              }
            `}
          >
            {item.isFloating ? (
              <i className={`${item.icon} text-xl`}></i>
            ) : (
              <>
                <i className={`${item.icon} text-lg`}></i>
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </Button>
        ))}
      </div>
    </nav>
  );
}
