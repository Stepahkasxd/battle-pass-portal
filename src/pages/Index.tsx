import { Navbar } from "@/components/Navbar";
import { BattlePassCard } from "@/components/BattlePassCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-colizeum-dark text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Добро пожаловать в{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-colizeum-red to-colizeum-cyan">
                Colizeum Battle Pass
              </span>
            </h1>
            <p className="text-gray-400">Выполняйте миссии, получайте награды, повышайте уровень</p>
          </div>
          
          <BattlePassCard
            level={1}
            currentXP={250}
            requiredXP={1000}
            isPremium={false}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-colizeum-red to-colizeum-cyan hover:opacity-90 transition-opacity"
            >
              Улучшить до Премиум
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="w-full border-colizeum-cyan text-colizeum-cyan hover:bg-colizeum-cyan/10"
            >
              Посмотреть Миссии
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;