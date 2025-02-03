import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-colizeum-darker text-white p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative animate-fade-in">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-colizeum-cyan via-colizeum-red to-colizeum-cyan opacity-20 blur animate-pulse" />
          <div className="relative bg-colizeum-gray rounded-lg p-8 shadow-2xl">
            <AlertTriangle className="mx-auto h-16 w-16 text-colizeum-cyan mb-6 animate-levitate" />
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <p className="text-xl text-gray-400 mb-6">
              Упс! Страница не найдена
            </p>
            <p className="text-gray-500 mb-8">
              Путь: {location.pathname}
            </p>
            <Link to="/">
              <Button
                className="bg-colizeum-cyan hover:bg-colizeum-cyan/80 text-black font-medium"
              >
                Вернуться на главную
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;