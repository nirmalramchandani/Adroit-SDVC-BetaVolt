"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, BarChart3, ChevronRight, Activity, Smartphone, Play, Download, ArrowRight } from "lucide-react";
import Image from "next/image";

interface LandingPageProps {
  onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden relative selection:bg-emerald-500/30">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5" />
      </div>

      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/20 p-2 rounded-xl ring-1 ring-emerald-500/30">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              BetaVolt <span className="text-emerald-400 font-extrabold">Instinct</span>
            </span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 hidden md:inline-flex">Features</Button>
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 hidden md:inline-flex">
              <a href="https://adroitsdvc.in/" target="_blank" rel="noopener noreferrer">About Us</a>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all rounded-full px-4"
            >
              <a href="https://drive.usercontent.google.com/download?id=1JaIAQAGMlaQF8wfsw9uggTl0jfUQ6Js_&export=download&authuser=0&confirm=t&uuid=45a399a1-27fb-41ef-9667-3b7304d9ffb1&at=AGN2oQ3JRj-Y2uUawV4fAjSIhQ92:1774273735952" download>
                <Download className="mr-2 h-4 w-4 text-emerald-400" /> <span className="hidden sm:inline">Download APK</span><span className="inline sm:hidden">APK</span>
              </a>
            </Button>
            <Button
              onClick={onLoginClick}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full px-6 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
            
            {/* Left Content (Text) */}
            <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                BetaVolt Smart Meter Super App
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Intelligent Energy <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                  Management
                </span>
              </h1>
              
              <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Experience the next generation of smart energy monitoring. Built by <strong className="text-slate-200">Team ADROIT SDVC</strong> and <strong className="text-slate-200">Intellismart</strong> to give you absolute control over your consumption.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4 flex-wrap">
                <Button 
                  onClick={onLoginClick}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white h-14 px-8 rounded-full text-lg font-semibold shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-105"
                >
                  Enter BetaVolt <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto h-14 px-8 rounded-full text-lg border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all hover:scale-105 hover:border-indigo-500/50"
                >
                  <a href="https://drive.google.com/file/d/1PcG0WcCJ5i0Kszxn5N_QtN4WbV4KDhhM/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                    <Play className="mr-2 h-5 w-5 text-indigo-400" /> Watch Demo
                  </a>
                </Button>
              </div>

              <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-xl uppercase tracking-wider">
                  TEAM ADROIT <span className="text-emerald-500">&times;</span> SDVC
                </div>
                <div className="w-px h-8 bg-slate-700"></div>
                <div className="flex items-center gap-2 text-slate-300 font-bold text-xl uppercase tracking-wider">
                  INTELLISMART
                </div>
              </div>
            </div>

            {/* Right Content (App UI Mockups & Media) */}
            <div className="flex-1 w-full max-w-md lg:max-w-none relative mt-10 lg:mt-0 perspective-1000">
              <div className="relative w-full aspect-[4/5] lg:aspect-square flex items-center justify-center">
                {/* Decorative glow behind device */}
                <div className="absolute inset-20 bg-emerald-500/20 rounded-full blur-3xl" />
                
                {/* Main Hero Device Mockup */}
                <div className="relative z-10 w-full max-w-[320px] rounded-[3rem] p-3 bg-slate-800 border-x-4 border-t-4 border-slate-700 shadow-2xl transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
                  <div className="absolute top-0 inset-x-0 h-8 flex justify-center items-start pt-2 z-20">
                    <div className="w-20 h-5 bg-slate-900 rounded-full" />
                  </div>
                  <div className="overflow-hidden rounded-[2.5rem] bg-slate-950 h-full w-full aspect-[9/19] relative ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center">
                       <Image 
                         src="/hero-mockup.png" 
                         alt="BetaVolt Super App UI" 
                         fill
                         className="object-cover"
                         priority
                       />
                       {/* Overlay subtle gradient to blend top and bottom */}
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 flex via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Floating Elements (Widgets) */}
                <div className="absolute top-[20%] right-[-10%] z-20 bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-xl shadow-black/50 backdrop-blur-xl animate-float" style={{ animationDelay: "0s" }}>
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-2 rounded-lg">
                      <Activity className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Live Usage</p>
                      <p className="text-lg font-bold text-white">2.4 kW</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-[15%] left-[-5%] z-20 bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-xl shadow-black/50 backdrop-blur-xl animate-float" style={{ animationDelay: "1.5s" }}>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Monthly Savings</p>
                      <p className="text-lg font-bold text-white">₹1,240</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Feature Section Snippet */}
      <section className="relative z-10 bg-slate-900/50 border-t border-white/5 py-24 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise Grade</h3>
              <p className="text-slate-400 leading-relaxed">Built with the highest security standards by Intellismart to ensure your energy data stays private and protected.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Analytics</h3>
              <p className="text-slate-400 leading-relaxed">Monitor your net generation, daily consumption, and grid health with up-to-the-second precision.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Prepaid</h3>
              <p className="text-slate-400 leading-relaxed">Manage your wallet, recharge boundaries, and tariff alerts instantly with our robust smart billing engine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global styles for floating animation and perspective */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}} />
    </div>
  );
}
