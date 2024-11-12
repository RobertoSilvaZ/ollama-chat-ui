import React, { useState } from "react";
import { X, Check, Search } from "lucide-react";
import {
  PREDEFINED_PROFILES,
  type ExtendedBotProfile,
} from "../constants/profiles";

interface BotProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BotProfile;
  onSave: (profile: BotProfile) => void;
}

export interface BotProfile {
  systemPrompt: string;
  temperature: number;
  title?: string;
}

export function BotProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: BotProfileModalProps) {
  const [formData, setFormData] = React.useState(profile);
  const [isCustom, setIsCustom] = React.useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleProfileSelect = (selectedProfile: ExtendedBotProfile) => {
    setFormData({
      ...selectedProfile,
      title: selectedProfile.title,
    });
    setIsCustom(false);
  };

  const filteredProfiles = PREDEFINED_PROFILES.filter(
    (profile) =>
      profile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl relative max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-white">
          Bot Profile Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(90vh-8rem)]">
          <div className="space-y-4 overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold text-white">
              Predefined Profiles
            </h3>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles..."
                className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
              {filteredProfiles.map((presetProfile, index) => (
                <button
                  key={index}
                  onClick={() => handleProfileSelect(presetProfile)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    !isCustom &&
                    formData.systemPrompt === presetProfile.systemPrompt
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="font-medium">{presetProfile.title}</div>
                      <div className="text-sm text-gray-400">
                        {presetProfile.description}
                      </div>
                    </div>
                    {!isCustom &&
                      formData.systemPrompt === presetProfile.systemPrompt && (
                        <Check size={16} />
                      )}
                  </div>
                </button>
              ))}
              {filteredProfiles.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No profiles match your search
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 overflow-y-auto pr-2"
          >
            <h3 className="text-lg font-semibold text-white sticky top-0 bg-gray-800 py-2">
              {isCustom ? "Custom Profile" : "Selected Profile"}
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Profile Title
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, title: e.target.value }));
                  setIsCustom(true);
                }}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                placeholder="Enter profile title..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                System Prompt
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    systemPrompt: e.target.value,
                  }));
                  setIsCustom(true);
                }}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 min-h-[200px]"
                placeholder="Enter system prompt..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Temperature ({formData.temperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    temperature: parseFloat(e.target.value),
                  }));
                  setIsCustom(true);
                }}
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-gray-800 py-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
