import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Edit2,
  Monitor,
  Cpu,
  Keyboard,
  Mouse,
  Speaker,
  Headphones,
  Watch,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { CardSkeleton } from "../components/Skeleton";
import type { Asset } from "../types";

const assetIconMap: { [key: string]: React.ReactNode } = {
  Monitor: <Monitor className="w-5 h-5" />,
  CPU: <Cpu className="w-5 h-5" />,
  Keyboard: <Keyboard className="w-5 h-5" />,
  Mouse: <Mouse className="w-5 h-5" />,
  Speaker: <Speaker className="w-5 h-5" />,
  "IP Phone": <Headphones className="w-5 h-5" />,
  Headset: <Headphones className="w-5 h-5" />,
  "Thin Client": <Watch className="w-5 h-5" />,
  Desk: <Package className="w-5 h-5" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DeskDetailsPage() {
  const { deskNumber } = useParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
const [selectedAsset, setSelectedAsset] = useState<any>(null);
const [editForm, setEditForm] = useState({
  asset_type: "",
  brand: "",
  model_number: "",
  serial_number: "",
  desk_number: "",
});

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assets/desk/${deskNumber}`
        );
        const data = await response.json();
        setAssets(data.assets || []);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [deskNumber]);

  const filteredAssets = assets.filter(
    (asset) =>
      asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.asset_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (index: number) => {
    const statuses = ["Active", "Inactive", "In Repair", "Maintenance"];
    const status = statuses[index % statuses.length];
    const statusColors: { [key: string]: string } = {
      Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Inactive: "bg-slate-100 text-slate-700 border-slate-200",
      "In Repair": "bg-amber-100 text-amber-700 border-amber-200",
      Maintenance: "bg-blue-100 text-blue-700 border-blue-200",
    };

    return {
      label: status,
      colors: statusColors[status],
      icon:
        status === "Active" ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : status === "In Repair" ? (
          <AlertCircle className="w-3.5 h-3.5" />
        ) : (
          <Clock className="w-3.5 h-3.5" />
        ),
    };
  };
 const token = localStorage.getItem("ams_token");
console.log(token);
const handleUpdate = async () => {
  if (!selectedAsset) return;
const token = localStorage.getItem("ams_token");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/assets/${selectedAsset.id}`,
      {
        method: "PUT",
     headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
},
        body: JSON.stringify(editForm),
      }
    );
    if (response.ok) {
      alert("Asset updated successfully");
      setSelectedAsset(null);
      window.location.reload();
    } else {
      alert("Update failed");
    }
  } catch (error) {
    console.error(error);
    alert("Error updating asset");
  }
};
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50"
    >
      {/* Gradient Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid" />
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                Desk {deskNumber}
              </h1>
              <p className="text-blue-100 text-lg">
                Asset Management Dashboard
              </p>
            </motion.div>

            {/* Header Stats */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8"
            >
              {[
                {
                  label: "Total Assets",
                  value: assets.length,
                  icon: <Package className="w-5 h-5" />,
                },
                {
                  label: "Last Updated",
                  value: lastUpdated ? lastUpdated.split(" ")[0] : "Now",
                  icon: <Clock className="w-5 h-5" />,
                },
                {
                  label: "Status",
                  value: "Active",
                  icon: <CheckCircle2 className="w-5 h-5" />,
                },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="glass p-4 rounded-xl flex items-center gap-3"
                >
                  <div className="p-2 bg-white/20 rounded-lg">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by brand, model, serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium pl-12 w-full shadow-lg focus:shadow-xl transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>

        {/* Results Count */}
        {!loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-slate-600 mb-6 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-blue-500" />
            Showing {filteredAssets.length} of {assets.length} assets
          </motion.p>
        )}

        {/* Assets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredAssets.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAssets.map((asset, idx) => {
              const status = getStatusBadge(idx);
              const icon = assetIconMap[asset.asset_type] || (
                <Package className="w-5 h-5" />
              );

              return (
                <motion.div
                  key={asset.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group card-premium p-6 cursor-pointer overflow-hidden"
                >
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />

                  <div className="relative z-10 space-y-4">
                    {/* Header with Icon and Status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white shadow-lg"
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {icon}
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {asset.asset_type}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {asset.brand}
                          </p>
                        </div>
                      </div>
                      
                      <motion.div
                        className={`badge border ${status.colors} flex items-center gap-1`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {status.icon}
                        {status.label}
                        
                      </motion.div>
                    </div>

                    {/* Asset Details */}
                    <div className="space-y-2 bg-slate-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                          Model:
                        </span>
                        <span className="font-mono text-sm font-medium text-slate-900">
                          {asset.model_number}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                          Serial:
                        </span>
                        <span className="font-mono text-sm font-medium text-slate-900">
                          {asset.serial_number}
                        </span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        ID: {asset.id.slice(0, 8)}
                      </span>
                    </div>

                    {/* Action Button */}
                    <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => {
  setSelectedAsset(asset);
setEditForm({
  asset_type: asset.asset_type,
  brand: asset.brand,
  model_number: asset.model_number,
  serial_number: asset.serial_number,
  desk_number: asset.desk_number,
});
}}
  className="btn-primary w-full mt-4 flex items-center justify-center gap-2 group/btn"
>
  <Edit2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
  Edit Asset
</motion.button>
                  </div>

                  {/* Hover Border Glow Effect */}
                  <div className="absolute inset-0 border-2 border-transparent rounded-2xl group-hover:border-blue-500/30 group-hover:shadow-glow transition-all duration-300 pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-premium p-12 text-center"
          >
            <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery ? "No assets found" : "No assets assigned"}
            </h3>
            <p className="text-slate-600">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "This desk currently has no assigned assets"}
            </p>
          </motion.div>
        )}
        
      </div>
  {selectedAsset && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-96">
      <h2 className="text-xl font-bold mb-4">Edit Asset</h2>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Brand"
        value={editForm.brand}
        onChange={(e) =>
          setEditForm({ ...editForm, brand: e.target.value })
        }
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Model Number"
        value={editForm.model_number}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            model_number: e.target.value,
          })
        }
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Serial Number"
        value={editForm.serial_number}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            serial_number: e.target.value,
          })
        }
      />

      <div className="flex gap-2">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleUpdate}
        >
          Save
        </button>

        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => setSelectedAsset(null)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </motion.div>
  );
}