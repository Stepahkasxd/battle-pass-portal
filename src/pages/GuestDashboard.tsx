import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const GuestDashboard = () => {
  const features = [
    {
      icon: <Trophy className="h-12 w-12 text-colizeum-cyan" />,
      title: "Боевой пропуск",
      description: "Получайте эксклюзивные награды и бонусы",
    },
    {
      icon: <Star className="h-12 w-12 text-colizeum-cyan" />,
      title: "Уникальные награды",
      description: "Разблокируйте особые предметы и скидки",
    },
    {
      icon: <Target className="h-12 w-12 text-colizeum-cyan" />,
      title: "Ежедневные миссии",
      description: "Выполняйте задания и получайте опыт",
    },
  ];

  return (
    <div className="min-h-screen bg-colizeum-dark p-4 pt-24">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Добро пожаловать в COLIZEUM
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Присоединяйтесь к нам и начните свое путешествие
          </p>
          <Link to="/auth">
            <Button className="bg-colizeum-cyan hover:bg-colizeum-cyan/90 text-black">
              Начать сейчас
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-colizeum-gray border-colizeum-cyan">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-center text-white">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-center text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/auth">
                  <Button variant="outline" className="w-full">
                    Узнать больше
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;