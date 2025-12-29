import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Upload, Trash2, AlertCircle, Check, Shield, X } from "lucide-react";
import { processImage } from "../../utils/imageProcessor";

const CUSTOM_IMAGE_KEY = "superflex_user_custom_image";

const ProfileImageModal = ({ isOpen, onClose, currentImage }) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setPreview(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PNG or JPEG image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview({ url: previewUrl, file });
  };

  const handleSave = async () => {
    if (!preview) return;
    setIsProcessing(true);
    try {
      const resizedImage = await processImage(preview.file);
      localStorage.setItem(CUSTOM_IMAGE_KEY, resizedImage);
      window.dispatchEvent(new Event("storage"));
      setPreview(null);
      onClose();
    } catch (err) {
      setError("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm("Remove custom profile picture?")) {
      localStorage.removeItem(CUSTOM_IMAGE_KEY);
      window.dispatchEvent(new Event("storage"));
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">Profile Picture</h3>
              <p className="text-sm text-zinc-500 font-medium">Update or remove your custom image</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/[0.03] border border-white/5 relative group">
             <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-x/20 overflow-hidden bg-zinc-800 flex items-center justify-center">
                  {preview ? (
                    <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                  ) : currentImage ? (
                    <img src={currentImage} alt="Profile" className="w-full h-full object-cover shadow-2xl" />
                  ) : (
                    <User size={48} className="text-zinc-600" />
                  )}
                </div>
                {!preview && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white font-bold text-xs"
                    >
                      Change
                    </button>
                )}
             </div>

             <div className="flex flex-col w-full gap-3">
                {!preview ? (
                   <>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-6 py-3 bg-x hover:bg-x/80 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Upload size={16} />
                      Upload New Image
                    </button>
                    {localStorage.getItem(CUSTOM_IMAGE_KEY) && (
                      <button 
                        onClick={handleRemove}
                        className="w-full px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-sm font-bold transition-all border border-rose-500/10 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Remove Custom Image
                      </button>
                    )}
                   </>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      disabled={isProcessing}
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold transition-all border border-emerald-500/20"
                    >
                      {isProcessing ? <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent animate-spin rounded-full" /> : <Check size={18} />}
                      Save
                    </button>
                    <button 
                      disabled={isProcessing}
                      onClick={() => setPreview(null)}
                      className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl text-sm font-bold transition-all border border-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                )}
             </div>

             {error && (
                <div className="flex items-center gap-2 text-rose-400 text-[10px] font-bold uppercase tracking-wider bg-rose-400/10 px-4 py-2 rounded-lg border border-rose-400/20 w-fit">
                  <AlertCircle size={12} />
                  {error}
                </div>
             )}
          </div>

          <div className="p-5 rounded-2xl bg-x/5 border border-x/10 space-y-2">
            <h4 className="text-x font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Shield size={14} />
              Privacy Note
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
              Your profile picture is processed locally and stored in your browser's local storage. SuperFlex does not upload it to any external servers.
            </p>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/png,image/jpeg,image/jpg"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileImageModal;
