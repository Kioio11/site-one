import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute left-0 top-2 h-0.5 w-full bg-muted"
        aria-hidden="true"
      >
        <div
          className="absolute h-full bg-primary transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>
      <ul className="relative flex w-full justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isCurrent = currentStep === index + 1;

          return (
            <li
              key={step.title}
              className="flex flex-col items-center text-center"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  {
                    "border-primary bg-primary text-primary-foreground": isCompleted || isCurrent,
                    "border-muted bg-background": !isCompleted && !isCurrent,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <p
                  className={cn("text-sm font-medium", {
                    "text-primary": isCurrent,
                    "text-muted-foreground": !isCurrent,
                  })}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  );
}
