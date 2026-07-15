import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        isOpen: true,
        title: options?.title || "Confirmation Required",
        description: message,
        confirmText: options?.confirmText || "Confirm",
        cancelText: options?.cancelText || "Cancel",
        resolve,
      });
    });
  };

  const handleCancel = () => {
    if (state) {
      state.resolve(false);
      setState(null);
    }
  };

  const handleConfirm = () => {
    if (state) {
      state.resolve(true);
      setState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <AlertDialog open={state.isOpen} onOpenChange={(open) => !open && handleCancel()}>
          <AlertDialogContent className="rounded-2xl sm:max-w-md shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">{state.title}</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 text-sm">
                {state.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 sm:gap-0 mt-4">
              <AlertDialogCancel onClick={handleCancel} className="rounded-xl h-11 font-semibold px-5">
                {state.cancelText}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirm}
                className="bg-destructive hover:bg-destructive/80 text-white rounded-xl h-11 font-semibold px-5 border-none"
              >
                {state.confirmText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
};
