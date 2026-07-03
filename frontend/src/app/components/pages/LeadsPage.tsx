import { useState } from "react";
import { motion } from "motion/react";
import { Filter, Phone, MessageSquare, Calendar, CheckCircle2, Sparkles } from "lucide-react";
import { mockLeads } from "../../data/mockData";
import { Lead } from "../../types";
import { BookingSchedulerModal } from "../modals/BookingSchedulerModal";
import { AIFollowupComposer } from "../modals/AIFollowupComposer";
import { toast } from "sonner";

export function LeadsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(mockLeads[0]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);

  const filters = [
    { id: "all", label: "All", count: mockLeads.length },
    { id: "new", label: "New", count: mockLeads.filter((l) => l.status === "new").length },
    { id: "contacted", label: "Contacted", count: mockLeads.filter((l) => l.status === "contacted").length },
    { id: "qualified", label: "Qualified", count: mockLeads.filter((l) => l.status === "qualified").length },
    { id: "booked", label: "Booked", count: mockLeads.filter((l) => l.status === "booked").length },
  ];

  const filteredLeads = selectedFilter === "all" 
    ? mockLeads 
    : mockLeads.filter((lead) => lead.status === selectedFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-700 border-blue-200";
      case "contacted": return "bg-purple-100 text-purple-700 border-purple-200";
      case "qualified": return "bg-amber-100 text-amber-700 border-amber-200";
      case "booked": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const handleMarkQualified = () => {
    toast.success("Lead marked as qualified");
  };

  return (
    <div className="h-screen flex">
      {/* Left Sidebar - Filters */}
      <div className="w-64 bg-card border-r border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Filter Leads</h3>
        </div>

        <div className="space-y-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                selectedFilter === filter.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-transparent text-foreground hover:bg-muted border border-transparent"
              }`}
            >
              <span className="font-medium">{filter.label}</span>
              <span className={`px-2 py-1 rounded-lg text-xs ${
                selectedFilter === filter.id 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="mt-8 p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground text-center">
              No {selectedFilter} leads yet — nice and quiet.
            </p>
          </div>
        )}
      </div>

      {/* Main Area - Lead List */}
      <div className="flex-1 overflow-auto p-8 bg-background">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Manage and qualify incoming service requests
          </p>
        </div>

        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 0.98 }}
              onClick={() => setSelectedLead(lead)}
              className={`bg-card border rounded-2xl p-6 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                selectedLead?.id === lead.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {lead.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{lead.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(lead.timestamp)}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm font-medium">
                  {lead.serviceType}
                </span>
              </div>

              <p className="text-sm text-foreground line-clamp-2">
                {lead.message}
              </p>

              {lead.preferredDate && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Preferred: {new Date(lead.preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Panel - Lead Snapshot */}
      {selectedLead && (
        <div className="w-96 bg-card border-l border-border p-6 overflow-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Lead Snapshot</h3>
            </div>
            
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
              <p className="text-sm text-foreground leading-relaxed">
                {selectedLead.aiSummary}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">Details</h4>
            <div className="space-y-3">
              <DetailRow label="Name" value={selectedLead.name} />
              <DetailRow label="Phone" value={selectedLead.phone} />
              <DetailRow label="Service" value={selectedLead.serviceType} />
              <DetailRow 
                label="Status" 
                value={
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                } 
              />
              {selectedLead.preferredDate && (
                <DetailRow 
                  label="Preferred Date" 
                  value={new Date(selectedLead.preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} 
                />
              )}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-2">Message</h4>
            <p className="text-sm text-foreground bg-muted p-4 rounded-xl">
              {selectedLead.message}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowFollowupModal(true)}
              className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-5 h-5" />
              Message
            </button>

            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full bg-accent text-accent-foreground px-4 py-3 rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Calendar className="w-5 h-5" />
              Book Job
            </button>

            {selectedLead.status !== "qualified" && selectedLead.status !== "booked" && (
              <button
                onClick={handleMarkQualified}
                className="w-full border border-border bg-card text-foreground px-4 py-3 rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Mark Qualified
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showBookingModal && selectedLead && (
        <BookingSchedulerModal
          lead={selectedLead}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showFollowupModal && selectedLead && (
        <AIFollowupComposer
          lead={selectedLead}
          onClose={() => setShowFollowupModal(false)}
        />
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground font-medium text-right">{value}</span>
    </div>
  );
}
