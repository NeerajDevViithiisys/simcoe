import { useState } from "react";
import { Quote, QuoteSettingsFormData, ServiceType } from "../types";
import { toast } from "react-toastify";
import { X } from "lucide-react";

// Add the QuoteSettingsDialog component
export const QuoteSettingsDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    quote?: Quote;
    onSubmit: (data: QuoteSettingsFormData) => Promise<void>;
  }> = ({ isOpen, onClose, quote, onSubmit }) => {
    const [formData, setFormData] = useState<QuoteSettingsFormData>({
      serviceType: quote?.serviceType || "EXTERIOR_WINDOW_CLEANING",
      setupMinutes: quote?.setupMinutes || 90,
      perUnitMinutes: quote?.perUnitMinutes || 3,
      hourlyCrewCharge: quote?.hourlyCrewCharge || 70,
      areaMinutes: quote?.areaMinutes || 0,
      stairsMinutes: quote?.stairsMinutes || 0,
      postsMinutes: quote?.postsMinutes || 0,
      railingMinutes: quote?.railingMinutes || 0,
      spindlesMinutes: quote?.spindlesMinutes || 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
    const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        // Create payload based on service type
        const payload = {
          serviceType: formData.serviceType,
          ...(formData.serviceType === "WOOD_POWERWASHING"
            ? {
                areaMinutes: formData.areaMinutes || 0,
                stairsMinutes: formData.stairsMinutes || 0,
                postsMinutes: formData.postsMinutes || 0,
                railingMinutes: formData.railingMinutes || 0,
                spindlesMinutes: formData.spindlesMinutes || 0,
              }
            : {
                setupMinutes: formData.setupMinutes || 0,
                perUnitMinutes: formData.perUnitMinutes || 0,
                hourlyCrewCharge: formData.hourlyCrewCharge || 0,
              }),
        };
        await onSubmit(payload);
        onClose();
      } catch (error) {
        console.error("Failed to save quote settings:", error);
        toast.error("Failed to save quote settings");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {quote ? "Edit Quote Settings" : "Create Quote Settings"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Type
              </label>
              <div className="relative mt-1">
                <div className="relative cursor-pointer" onClick={toggleDropdown}>
                  <div className="block w-full rounded border border-gray-300 px-3 py-3 text-sm flex items-center justify-between">
                    <span>
                      {formData.serviceType
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                    <svg
                      className="h-5 w-5 text-[#C49C3C]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
  
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded border border-gray-200 py-1 overflow-auto max-h-56">
                      {Object.values(ServiceType).map((type) => (
                        <div
                          key={type}
                          className={`px-4 py-2 cursor-pointer hover:bg-[#C49C3C] hover:text-white transition-colors ${
                            formData.serviceType === type
                              ? "bg-[#C49C3C] text-white font-medium"
                              : ""
                          }`}
                          onClick={() => {
                            setFormData({ ...formData, serviceType: type });
                            setIsDropdownOpen(false);
                          }}
                        >
                          {type
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/^\w/, (c) => c.toUpperCase())}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
  
            {formData.serviceType === "WOOD_POWERWASHING" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Area Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.areaMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        areaMinutes: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stairs Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.stairsMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stairsMinutes: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Posts Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.postsMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postsMinutes: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Railing Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.railingMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        railingMinutes: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Spindles Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.spindlesMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spindlesMinutes: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                    required
                    min="0"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Setup Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.setupMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        setupMinutes: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Per Unit Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.perUnitMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        perUnitMinutes: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hourly Crew Charge
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyCrewCharge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hourlyCrewCharge: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                    required
                    min="0"
                  />
                </div>
              </>
            )}
  
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-[#C49C3C] rounded hover:bg-[#B38C2C] disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : quote ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };