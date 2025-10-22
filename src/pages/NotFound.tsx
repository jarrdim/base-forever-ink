import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center relative z-10">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="glass p-12 rounded-3xl">
          <div className="text-8xl mb-4 font-serif font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            404
          </div>
          <h1 className="mb-4 text-3xl font-serif font-bold">Page Not Found</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Oops! The page you're looking for doesn't exist on the blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/guestbook">
                <Search className="w-4 h-4 mr-2" />
                Visit Guestbook
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
