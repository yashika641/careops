import { Package, AlertTriangle, TrendingDown, RefreshCw } from "lucide-react";
import { mockInventory } from "../../data/mockData";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";

export function InventoryPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-600 bg-green-50";
      case "low": return "text-amber-600 bg-amber-50";
      case "out": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "low": return <AlertTriangle className="w-4 h-4" />;
      case "out": return <TrendingDown className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Inventory</h1>
        <p className="text-muted-foreground mt-1">
          Track supplies and get alerts when stock runs low
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Items</span>
            <Package className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-semibold text-foreground">{mockInventory.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">In Stock</span>
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {mockInventory.filter((i) => i.status === "good").length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Low Stock</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {mockInventory.filter((i) => i.status === "low").length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Out of Stock</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {mockInventory.filter((i) => i.status === "out").length}
          </p>
        </motion.div>
      </div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                  Item Name
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                  Stock Level
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                  Threshold
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                  Trend
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                  Last Updated
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {mockInventory.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                    item.status === "low" ? "bg-amber-50/30" : ""
                  } ${item.status === "out" ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground font-semibold text-lg">
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground">{item.threshold}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={item.usageTrend.map((value, i) => ({
                            value,
                            index: i,
                          }))}
                        >
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={
                              item.status === "good"
                                ? "#10B981"
                                : item.status === "low"
                                ? "#F59E0B"
                                : "#EF4444"
                            }
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {item.lastUpdated.toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all text-sm">
                      <RefreshCw className="w-4 h-4" />
                      Reorder
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Empty State Example (commented out) */}
      {/* <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">
          No inventory items yet — let's add some supplies.
        </p>
      </div> */}
    </div>
  );
}
