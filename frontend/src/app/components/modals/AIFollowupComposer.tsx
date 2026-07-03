import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Edit2, Clock, Mail, MessageSquare, Send, Sparkles } from "lucide-react";
import { Lead } from "../../types";
import { toast } from "sonner";

interface AIFollowupComposerProps {
  lead: Lead;
  onClose: () => void;
}

export function AIFollowupComposer({ lead, onClose }: AIFollowupComposerProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [channel, setChannel] = useState<"sms" | "whatsapp" | "email">("sms");
  const [scheduleTime, setScheduleTime] = useState<"now" | "later">("now");

  const suggestions = [
    {
      id: "friendly",
      title: "Friendly",
      message: `Hey ${lead.name.split(' ')[0]} — just checking if ${lead.preferredDate ? new Date(lead.preferredDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'this weekend'} still works for you?`,
      tone: "Warm and casual",
    },
    {
      id: "urgent",
      title: "Urgent",
      message: `Hi ${lead.name.split(' ')[0]}, last slot left for ${lead.preferredDate ? new Date(lead.preferredDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'this weekend'} morning — want me to hold it?`,
      tone: "Creates urgency",
    },
    {
      id: "incentive",
      title: "Incentive",
      message: `Hi ${lead.name.split(' ')[0]} — we can offer 10% off if you confirm today 👍`,
      tone: "Encourages action",
    },
  ];

  const handleSend = () => {
    const message = selectedSuggestion 
      ? suggestions.find((s) => s.id === selectedSuggestion)?.message 
      : customMessage;

    if (scheduleTime === "now") {
      toast.success(
        <div className="flex items-start gap-2">
          <span>Message sent to {lead.name} via {channel.toUpperCase()}</span>
        </div>
      );
    } else {
      toast.success("Message scheduled successfully");
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-semibold text-foreground">AI Follow-up</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Send a follow-up to {lead.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
            {/* AI Suggestions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                AI-Generated Suggestions
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {suggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    onClick={() => {
                      setSelectedSuggestion(suggestion.id);
                      setCustomMessage(suggestion.message);
                    }}
                    whileHover={{ y: -2 }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedSuggestion === suggestion.id
                        ? "bg-accent/10 border-accent ring-2 ring-accent/20"
                        : "bg-card border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{suggestion.title}</h4>
                      {selectedSuggestion === suggestion.id && (
                        <div className="w-2 h-2 bg-accent rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{suggestion.tone}</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {suggestion.message}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Message Editor */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Your Message</h3>
                <button
                  onClick={() => setSelectedSuggestion(null)}
                  className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit inline
                </button>
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your own message..."
                rows={4}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {customMessage.length} characters
              </p>
            </div>

            {/* Channel Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Choose Channel
              </h3>
              <div className="flex gap-3">
                <ChannelButton
                  icon={<MessageSquare className="w-5 h-5" />}
                  label="SMS"
                  value="sms"
                  selected={channel === "sms"}
                  onClick={() => setChannel("sms")}
                />
                <ChannelButton
                  icon={<MessageSquare className="w-5 h-5" />}
                  label="WhatsApp"
                  value="whatsapp"
                  selected={channel === "whatsapp"}
                  onClick={() => setChannel("whatsapp")}
                />
                <ChannelButton
                  icon={<Mail className="w-5 h-5" />}
                  label="Email"
                  value="email"
                  selected={channel === "email"}
                  onClick={() => setChannel("email")}
                />
              </div>
            </div>

            {/* Schedule Options */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                When to Send
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setScheduleTime("now")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                    scheduleTime === "now"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <Send className="w-5 h-5" />
                  Send Now
                </button>
                <button
                  onClick={() => setScheduleTime("later")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                    scheduleTime === "later"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  Schedule Send
                </button>
              </div>

              {scheduleTime === "later" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3"
                >
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!customMessage.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              <Send className="w-5 h-5" />
              {scheduleTime === "now" ? "Send Message" : "Schedule Message"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ChannelButton({
  icon,
  label,
  value,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
        selected
          ? "bg-primary/10 border-primary text-primary"
          : "bg-card border-border hover:bg-muted"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
