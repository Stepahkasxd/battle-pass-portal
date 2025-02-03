import { Button } from "@/components/ui/button";
import { Trophy, User, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-colizeum-dark/95 backdrop-blur-sm border-b border-colizeum-gray z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">COLIZEUM</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/battlepass">
            <Button variant="ghost" className="text-white hover:text-colizeum-cyan">
              <Trophy className="w-5 h-5 mr-2" />
              Battle Pass
            </Button>
          </Link>
          
          <Link to="/shop">
            <Button variant="ghost" className="text-white hover:text-colizeum-cyan">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Shop
            </Button>
          </Link>
          
          <Link to="/profile">
            <Button variant="ghost" className="text-white hover:text-colizeum-cyan">
              <User className="w-5 h-5 mr-2" />
              Profile
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};