import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar as CalendarIcon, Clock, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Lead } from "../../types";
import { toast } from "sonner";

interface BookingSchedulerModalProps {
  lead: Lead;
  onClose: () => void;
}

export function BookingSchedulerModal({ lead, onClose }: BookingSchedulerModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  const staff = [
    { id: "1", name: "Rajesh Kumar", available: true },
    { id: "2", name: "Priya Singh", available: true },
    { id: "3", name: "Amit Patel", available: false },
    { id: "4", name: "Sneha Reddy", available: true },
  ];

  const handleConfirm = () => {
    toast.success(
      <div className="flex items-start gap-2">
        <span>Nice — you're booked! We'll remind you 24 hrs before. 👍</span>
      </div>
    );
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Book Job</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Schedule appointment for {lead.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-12 h-1 rounded ${
                        step > s ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-16 mt-3">
              <span className={`text-xs ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                Date & Time
              </span>
              <span className={`text-xs ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                Assign Staff
              </span>
              <span className={`text-xs ${step >= 3 ? "text-foreground" : "text-muted-foreground"}`}>
                Confirm
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-280px)]">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Select Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-3 rounded-xl border transition-all ${
                          selectedTime === time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:bg-muted"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inventory Warning */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Low on air filters
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Consider suggesting an alternate date or reorder supplies.
                    </p>
                  </div>
                </motion.div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Assign Staff Member
                </label>
                {staff.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => member.available && setSelectedStaff(member.name)}
                    disabled={!member.available}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      selectedStaff === member.name
                        ? "bg-primary/10 border-primary text-primary"
                        : member.available
                        ? "bg-card border-border hover:bg-muted"
                        : "bg-muted border-border opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    {member.available ? (
                      <span className="text-sm text-green-600">Available</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unavailable</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-muted rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Booking Summary</h3>
                  <div className="space-y-3">
                    <SummaryRow
                      icon={<User className="w-5 h-5 text-primary" />}
                      label="Client"
                      value={lead.name}
                    />
                    <SummaryRow
                      icon={<CalendarIcon className="w-5 h-5 text-primary" />}
                      label="Date"
                      value={selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "Not selected"}
                    />
                    <SummaryRow
                      icon={<Clock className="w-5 h-5 text-primary" />}
                      label="Time"
                      value={selectedTime || "Not selected"}
                    />
                    <SummaryRow
                      icon={<User className="w-5 h-5 text-primary" />}
                      label="Staff"
                      value={selectedStaff || "Not assigned"}
                    />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800">
                    All set! We'll send a confirmation message to {lead.name}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex gap-3 justify-end">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!selectedDate || !selectedTime)) ||
                  (step === 2 && !selectedStaff)
                }
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                Confirm Booking
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
