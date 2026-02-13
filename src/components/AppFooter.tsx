import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const AppFooter = () => {
  const handleContactClick = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href =
        "mailto:fafakentertainments@gmail.com?subject=FLAMES Finder Inquiry";
    } else {
      window.open(
        "https://mail.google.com/mail/?view=cm&fs=1&to=fafakentertainments@gmail.com&su=FLAMES%20Finder%20Inquiry",
        "_blank",
      );
    }
  };

  return (
    <div className="w-full border-t border-border bg-background/60 backdrop-blur-md backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-4 py-4 text-center space-y-2">

        <Button
          variant="outline"
          size="sm"
          onClick={handleContactClick}
          className="border-border hover:border-primary hover:bg-primary/10 h-8 text-xs"
        >
          <Mail className="w-3.5 h-3.5 mr-1.5" />
          Contact Us
        </Button>

        <p className="text-[11px] sm:text-xs text-muted-foreground">
          © {new Date().getFullYear()} Fafak Entertainment. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AppFooter;
