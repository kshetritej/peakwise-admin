import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTripStore } from "@/store/useTripStore";

type TStepProps = {
  stepNumber: number;
  stepText: string;
};

export default function StepButton({
  stepNumber,
  stepText,
}: Readonly<TStepProps>) {
  const step = useTripStore((state:any) => state.currentStep);
  const setStepCount = useTripStore((state:any) => state.setStep);
  return (
    <Button
      className={cn(
        step == stepNumber
          ? "bg-slate-200 border-l-rose-500 border-l-2"
          : "border-l-slate-100",
        "rounded-none w-full hover:border-l-rose-500 border-l-2  min-w-[200px] flex justify-start"
      )}
      variant={"ghost"}
      onClick={() => {
        setStepCount(stepNumber)
      }}
    >
      {stepText}
    </Button>
  );
}
