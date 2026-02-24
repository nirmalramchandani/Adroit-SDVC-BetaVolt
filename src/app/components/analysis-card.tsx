"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bot, Lightbulb, Loader2, AlertTriangle } from "lucide-react";
import type { AnalyzeConsumptionPatternsOutput } from "@/ai/flows/analyze-consumption-patterns";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisCardProps {
  analysis: AnalyzeConsumptionPatternsOutput | null;
  isLoading: boolean;
  onRunAnalysis: () => void;
}

export function AnalysisCard({ analysis, isLoading, onRunAnalysis }: AnalysisCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">AI Consumption Analysis</CardTitle>
            <CardDescription>Get insights and predictions on your energy usage.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Overall Analysis</h4>
              <p className="text-sm text-muted-foreground">{analysis.overallAnalysis}</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {analysis.analysisResults.map((result) => (
                <AccordionItem value={result.deviceId} key={result.deviceId}>
                  <AccordionTrigger className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {result.isUnusual && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      {result.deviceName}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm">
                    <p className="text-muted-foreground"><strong>Status:</strong> {result.isUnusual ? 'Unusual Consumption' : 'Normal'}</p>
                    <p className="text-muted-foreground"><strong>Reason:</strong> {result.reason}</p>
                    <div className="bg-primary/10 p-3 rounded-md mt-2">
                      <p className="flex items-start gap-2 text-primary">
                        <Lightbulb className="h-4 w-4 mt-1 shrink-0"/>
                        <span><strong>Suggestion:</strong> {result.suggestion}</span>
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Click the button to analyze your home's energy consumption.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onRunAnalysis} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              Run AI Analysis
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
