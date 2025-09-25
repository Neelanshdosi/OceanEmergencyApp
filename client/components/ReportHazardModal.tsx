import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReportForm } from "@/components/ReportForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportHazardModal: React.FC<Props> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report Hazard</DialogTitle>
        </DialogHeader>
        <div>
          {/* ReportForm handles submission and will call onSubmitted when done */}
          <ReportForm
            onSubmitted={() => {
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportHazardModal;
