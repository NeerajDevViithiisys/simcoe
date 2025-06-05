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
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
  
    const validateField = (name: string, value: number) => {
      if (value < 0) {
        return "Value cannot be negative";
      }
      if (isNaN(value)) {
        return "Please enter a valid number";
      }
      return "";
    };
  
    const handleBlur = (name: string) => {
      setTouched(prev => ({ ...prev, [name]: true }));
      const value = formData[name as keyof QuoteSettingsFormData] as number;
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    };
  
    const handleChange = (name: string, value: string) => {
      const numValue = parseInt(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
      if (touched[name]) {
        const error = validateField(name, numValue);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    };
  
    const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validate all fields
      const newErrors: Record<string, string> = {};
      Object.keys(formData).forEach(key => {
        if (key !== 'serviceType') {
          const value = formData[key as keyof QuoteSettingsFormData] as number;
          const error = validateField(key, value);
          if (error) {
            newErrors[key] = error;
          }
        }
      });
  
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        return;
      }
  
      setIsSubmitting(true);
      try {
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
  
    const getInputClassName = (name: string) => {
      const baseClasses = "mt-1 block w-full p-3 rounded border focus:ring-0 sm:text-sm";
      if (touched[name] && errors[name]) {
        return `${baseClasses} border-red-500 focus:border-red-500`;
      }
      return `${baseClasses} border-gray-300 focus:border-[#C49C3C]`;
    };
  
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
                    onChange={(e) => handleChange('areaMinutes', e.target.value)}
                    onBlur={() => handleBlur('areaMinutes')}
                    className={getInputClassName('areaMinutes')}
                    required
                    min="0"
                  />
                  {touched.areaMinutes && errors.areaMinutes && (
                    <p className="mt-1 text-sm text-red-600">{errors.areaMinutes}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stairs Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.stairsMinutes}
                    onChange={(e) => handleChange('stairsMinutes', e.target.value)}
                    onBlur={() => handleBlur('stairsMinutes')}
                    className={getInputClassName('stairsMinutes')}
                    required
                    min="0"
                  />
                  {touched.stairsMinutes && errors.stairsMinutes && (
                    <p className="mt-1 text-sm text-red-600">{errors.stairsMinutes}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Posts Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.postsMinutes}
                    onChange={(e) => handleChange('postsMinutes', e.target.value)}
                    onBlur={() => handleBlur('postsMinutes')}
                    className={getInputClassName('postsMinutes')}
                    required
                    min="0"
                  />
                  {touched.postsMinutes && errors.postsMinutes && (
                    <p className="mt-1 text-sm text-red-600">{errors.postsMinutes}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Railing Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.railingMinutes}
                    onChange={(e) => handleChange('railingMinutes', e.target.value)}
                    onBlur={() => handleBlur('railingMinutes')}
                    className={getInputClassName('railingMinutes')}
                    required
                    min="0"
                  />
                  {touched.railingMinutes && errors.railingMinutes && (
                    <p className="mt-1 text-sm text-red-600">{errors.railingMinutes}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Spindles Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.spindlesMinutes}
                    onChange={(e) => handleChange('spindlesMinutes', e.target.value)}
                    onBlur={() => handleBlur('spindlesMinutes')}
                    className={getInputClassName('spindlesMinutes')}
                    required
                    min="0"
                  />
                  {touched.spindlesMinutes && errors.spindlesMinutes && (
                    <p className="mt-1 text-sm text-red-600">{errors.spindlesMinutes}</p>
                  )}
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
                    onChange={(e) => handleChange('setupMinutes', e.target.value)}
                    onBlur={() => handleBlur('setupMinutes')}
                    className={getInputClassName('setupMinutes')}
                    required
                    min="0"
                  />
                  {touched.setupMinutes && errors.setupMinutes && (
                    <p className="mt-1 text-sm text-red-600">{errors.setupMinutes}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Per Unit Minutes
                  </label>
                  <input
                    type="number"
                    value={formData.perUnitMinutes}
                    onChange={(e) => handleChange('perUnitMinutes', e.target.value)}
                    onBlur={() => handleBlur('perUnitMinutes')}
                    className={getInputClassName('perUnitMinutes')}
                    required
                    min="0"
                  />
                  {touched.perUnitMinutes && errors.perUnitMinutes && (
                    <p className="mt-1 text-sm text-red-600">{errors.perUnitMinutes}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hourly Crew Charge
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyCrewCharge}
                    onChange={(e) => handleChange('hourlyCrewCharge', e.target.value)}
                    onBlur={() => handleBlur('hourlyCrewCharge')}
                    className={getInputClassName('hourlyCrewCharge')}
                    required
                    min="0"
                  />
                  {touched.hourlyCrewCharge && errors.hourlyCrewCharge && (
                    <p className="mt-1 text-sm text-red-600">{errors.hourlyCrewCharge}</p>
                  )}
                </div>
              </>
            )}
  
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-[#C49C3C] border border-transparent rounded-md hover:bg-[#B38B2B] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };