"use client";

import StepButton from "@/components/atoms/step-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTripStore } from "@/store/useTripStore";
import React, { Suspense } from "react";

function LayoutContent({ children }: Readonly<{ children: React.ReactNode }>) {
  const currStep = useTripStore((step) => step.currentStep);
  const stepsTexts = [
    "Basic Information",
    "Capacity and Duration",
    "Itinerary",
    "Inclusions and Exclusions",
    "Meeting and Dropoffs",
    "Media and Highlights",
    "Pricing",
    "Additional Info",
    "FAQs",
    "SEO",
  ];

  return (
    <div className="flex w-full max-w-screen mx-auto">
      <nav className="bg-accent rounded-none p-2 mb-6 min-h-screen sticky top-0 w-[260px]">
        <ScrollArea className="">
          <ul className="flex items-start justify-start gap-2 min-w-max flex-col">
            <li>
              <StepButton stepNumber={1} stepText="Basic Information" />
            </li>
            <li>
              <StepButton stepNumber={2} stepText="Capacity and Duration" />
            </li>
            <li>
              <StepButton stepNumber={3} stepText="Itinerary" />
            </li>
            <li>
              <StepButton stepNumber={4} stepText="Inclusions and Exclusions" />
            </li>
            <li>
              <StepButton stepNumber={5} stepText="Meetings and Dropoffs" />
            </li>
            <li>
              <StepButton stepNumber={6} stepText="Media and Highlights" />
            </li>
            <li>
              <StepButton stepNumber={7} stepText="Pricing" />
            </li>
            <li>
              <StepButton stepNumber={8} stepText="Additional Info" />
            </li>
            <li>
              <StepButton stepNumber={9} stepText="FAQs" />
            </li>
            <li>
              <StepButton stepNumber={10} stepText="SEO" />
            </li>
            <li>
              <StepButton stepNumber={11} stepText="Featured" />
            </li>
          </ul>
        </ScrollArea>
      </nav>

      <section className="flex-1 px-6">
        <h2 className="font-bold text-xl mb-6">{stepsTexts[currStep - 1]}</h2>
        <ScrollArea className="h-[calc(100vh-4rem)] w-full">
          {children}
        </ScrollArea>
      </section>
    </div>
  );
}

export default function CreateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
