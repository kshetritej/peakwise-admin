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
  const step = useTripStore((state: any) => state.currentStep);
  const setStepCount = useTripStore((state: any) => state.setStep);
  return (
    <Button
      className={cn(
        step == stepNumber
          ? "bg-primary  border-l-primary border-l-2 w-full text-white hover:bg-primary/90 hover:text-white"
          : "border-l-secondary hover:bg-primary hover:text-white",
        "rounded-none w-full hover:border-l-primary border-l-2 w-[100cqw] flex justify-start",
      )}
      variant={"ghost"}
      onClick={() => {
        setStepCount(stepNumber);
      }}
    >
      {stepText}
    </Button>
  );
}
