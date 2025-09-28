import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Moon, 
  Sun, 
  Eye, 
  Type, 
  Contrast,
  Save,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const AccessibilitySettings = () => {
  const [settings, setSettings] = useState({
    theme: 'light', // light, dark, high-contrast
    fontSize: 'medium', // small, medium, large, extra-large
    colorBlind: 'none', // none, protanopia, deuteranopia, tritanopia
    reducedMotion: false,
    screenReader: false,
    language: 'en' // en, hi, te (English, Hindi, Telugu)
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('ecolearn-accessibility');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = (newSettings) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Apply theme
    root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    body.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    
    root.classList.add(`theme-${newSettings.theme}`);
    body.classList.add(`theme-${newSettings.theme}`);
    
    // Apply font size
    root.classList.remove('text-small', 'text-medium', 'text-large', 'text-extra-large');
    body.classList.remove('text-small', 'text-medium', 'text-large', 'text-extra-large');
    
    root.classList.add(`text-${newSettings.fontSize}`);
    body.classList.add(`text-${newSettings.fontSize}`);
    
    // Apply color blind settings
    root.classList.remove('colorblind-none', 'colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    root.classList.add(`colorblind-${newSettings.colorBlind}`);
    
    // Apply reduced motion
    if (newSettings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem('ecolearn-accessibility', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    const defaultSettings = {
      theme: 'light',
      fontSize: 'medium',
      colorBlind: 'none',
      reducedMotion: false,
      screenReader: false,
      language: 'en'
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.setItem('ecolearn-accessibility', JSON.stringify(defaultSettings));
    toast.success('Settings reset to default');
  };

  const languages = {
    en: 'English',
    hi: 'हिन्दी (Hindi)',
    te: 'తెలుగు (Telugu)'
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    'high-contrast': Contrast
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors z-40 flex items-center justify-center"
        title="Accessibility Settings"
        aria-label="Open accessibility settings"
      >
        <Eye size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="mr-3" size={24} />
              <h2 className="text-xl font-bold">Accessibility Settings</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-green-700 p-2 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Settings content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            
            {/* Theme Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Monitor className="mr-2" size={20} />
                Display Theme
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(themeIcons).map(([theme, Icon]) => (
                  <button
                    key={theme}
                    onClick={() => updateSetting('theme', theme)}
                    className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                      settings.theme === theme
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs capitalize">
                      {theme.replace('-', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Type className="mr-2" size={20} />
                Text Size
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {['small', 'medium', 'large', 'extra-large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting('fontSize', size)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      settings.fontSize === size
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <span className={`block font-medium ${
                      size === 'small' ? 'text-xs' :
                      size === 'medium' ? 'text-sm' :
                      size === 'large' ? 'text-base' : 'text-lg'
                    }`}>
                      Aa
                    </span>
                    <span className="text-xs capitalize mt-1 block">
                      {size.replace('-', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Blind Support */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Eye className="mr-2" size={20} />
                Color Vision
              </h3>
              <select
                value={settings.colorBlind}
                onChange={(e) => updateSetting('colorBlind', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
              >
                <option value="none">Normal Color Vision</option>
                <option value="protanopia">Protanopia (Red-blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                <option value="tritanopia">Tritanopia (Blue-blind)</option>
              </select>
            </div>

            {/* Language Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                🌐 Language
              </h3>
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            {/* Motion & Audio Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Motion & Interaction</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span>Reduce Motion Effects</span>
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span>Screen Reader Support</span>
                  <input
                    type="checkbox"
                    checked={settings.screenReader}
                    onChange={(e) => updateSetting('screenReader', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex space-x-3">
            <button
              onClick={resetSettings}
              className="flex-1 btn-secondary flex items-center justify-center"
            >
              <RotateCcw className="mr-2" size={16} />
              Reset
            </button>
            <button
              onClick={() => {
                toast.success('Settings saved successfully!');
                setIsOpen(false);
              }}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              <Save className="mr-2" size={16} />
              Save
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            Settings are automatically saved to your device
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;