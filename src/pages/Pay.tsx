import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Pay = () => {
  return (
    <div className="min-h-screen bg-colizeum-dark text-white pt-24">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Премиум Боевой Пропуск
          </h1>
          <p className="text-gray-400">
            Разблокируйте все премиум награды и возможности
          </p>
        </div>

        <Card className="bg-colizeum-gray border-colizeum-cyan/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Премиум Доступ</span>
              <span className="text-colizeum-cyan">499 ₽</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Единоразовая оплата за текущий сезон
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-colizeum-cyan" />
                <span>Доступ ко всем премиум наградам</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-colizeum-cyan" />
                <span>Ускоренный прогресс</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-colizeum-cyan" />
                <span>Эксклюзивные возможности</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full bg-gradient-to-r from-colizeum-red to-colizeum-cyan hover:opacity-90 transition-opacity"
              size="lg"
            >
              Купить за 499 ₽
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-colizeum-cyan text-colizeum-cyan hover:bg-colizeum-cyan/10"
              asChild
            >
              <Link to="/">
                Вернуться назад
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            Оплата безопасно обрабатывается через защищенное соединение.
            <br />
            После оплаты доступ будет активирован автоматически.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pay;