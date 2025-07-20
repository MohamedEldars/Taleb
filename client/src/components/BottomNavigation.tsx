import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", icon: "fas fa-home", label: "الرئيسية", page: "home" },
  { path: "/profile", icon: "fas fa-user", label: "ملفي", page: "profile" },
  { path: "/upload", icon: "fas fa-plus", label: "إنشاء", page: "upload", isFloating: true },
  { path: "/settings", icon: "fas fa-cog", label: "إعدادات", page: "settings" },
  { path: "/admin", icon: "fas fa-user-shield", label: "إدارة", page: "admin" },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white/95 backdrop-blur-md border-t border-neutral-200 px-2 py-2 z-50 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="sm"
            onClick={() => setLocation(item.path)}
            className={`
              flex flex-col items-center gap-1 py-2 px-2 transition-all duration-300 rounded-xl
              ${item.isFloating 
                ? "bg-gradient-to-r from-primary to-secondary text-white rounded-full w-12 h-12 -mt-3 hover:scale-110 shadow-xl border-2 border-white" 
                : location === item.path 
                  ? "text-primary bg-primary/10" 
                  : "text-neutral-500 hover:text-primary hover:bg-primary/5"
              }
            `}
          >
            {item.isFloating ? (
              <i className={`${item.icon} text-xl`}></i>
            ) : (
              <>
                <i className={`${item.icon} text-lg`}></i>
                <span className="text-xs font-medium leading-none">{item.label}</span>
              </>
            )}
          </Button>
        ))}
      </div>
    </nav>
  );
}
