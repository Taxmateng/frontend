"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Wallet, Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "glass-card py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">T</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground transition-colors">
            Taxmate
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
            How it Works
          </Link>
          <Link href="/dashboard" className="px-5 py-2.5 bg-primary hover:bg-secondary text-white text-sm font-medium rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Launch App
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full glass-card border-t border-border p-4 flex flex-col gap-4 shadow-lg md:hidden">
         <Link href="#features" className="text-foreground font-medium p-2 hover:bg-background rounded" onClick={() => setIsMobileMenuOpen(false)}>
            Features
          </Link>
          <Link href="#how-it-works" className="text-foreground font-medium p-2 hover:bg-background rounded" onClick={() => setIsMobileMenuOpen(false)}>
            How it Works
          </Link>
          <Link href="/dashboard" className="w-full text-center px-5 py-3 bg-primary text-white font-medium rounded-full mt-2" onClick={() => setIsMobileMenuOpen(false)}>
            Launch App
          </Link>
        </div>
      )}
    </nav>
  );
}
