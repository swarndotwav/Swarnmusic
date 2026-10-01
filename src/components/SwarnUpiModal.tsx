import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Heart, Sparkles, ExternalLink } from 'lucide-react';

interface SwarnUpiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SWARN_UPI_ID = '9708298001@fam';

export const SwarnUpiModal: React.FC<SwarnUpiModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate UPI standard payment URI
    const upiUri = `upi://pay?pa=${encodeURIComponent(SWARN_UPI_ID)}&pn=Swarn&cu=INR&tn=Support%20Swarn%20Music`;
    
    QRCode.toDataURL(upiUri, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1C1917', // Stone-900 dark squares
        light: '#FAF7F2', // Warm parchment background matching Swarn palette
      },
      errorCorrectionLevel: 'H', // High error correction allows center logo
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate UPI QR:', err));
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#FAF7F2] rounded-2xl border border-[#DFCFC0] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#7A131B] text-white p-4.5 relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-xs">
              {/* Golden Swarn emblem bird */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-amber-300">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c-2.48 0-4.5-2.02-4.5-4.5 0-.7.16-1.36.45-1.95l1.58 1.58c-.02.12-.03.24-.03.37 0 1.38 1.12 2.5 2.5 2.5.13 0 .25-.01.37-.03l1.58 1.58c-.59.29-1.25.45-1.95.45zm3.05-3.05l-1.58-1.58c.02-.12.03-.24.03-.37 0-1.38-1.12-2.5-2.5-2.5-.13 0-.25.01-.37.03L10.05 7.5c.59-.29 1.25-.45 1.95-.45 2.48 0 4.5 2.02 4.5 4.5 0 .7-.16 1.36-.45 1.95z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Support Swarn</span>
                <Sparkles size={13} className="text-amber-300" />
              </h3>
              <p className="text-[11px] text-amber-100/80 font-sans">
                Community Fund · Acoustic Music Movement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-5 flex flex-col items-center text-center space-y-4">
          <div className="relative p-2.5 bg-white rounded-xl border border-[#DFCFC0] shadow-sm">
            {qrDataUrl ? (
              <div className="relative">
                <img
                  src={qrDataUrl}
                  alt="Swarn UPI QR Code"
                  className="w-60 h-60 rounded-lg object-contain"
                />
                {/* Center Badge matching FamPay gold wing emblem from user screenshot */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-[#2A1E14] border-2 border-[#FAF7F2] shadow-md flex items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-7 h-7 fill-[#F5A623]"
                    >
                      {/* Winged stylized bird shape matching the user's QR center */}
                      <path d="M50 15 C60 30, 80 40, 88 38 C75 52, 60 56, 52 56 C52 64, 46 76, 38 85 C38 72, 42 62, 45 56 C35 56, 20 48, 12 38 C22 40, 40 32, 50 15 Z" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-60 h-60 bg-stone-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-stone-500">
                Generating QR Code...
              </div>
            )}
          </div>

          <p className="text-xs text-stone-600 font-medium max-w-[260px] mx-auto leading-relaxed">
            Scan this QR code with any UPI app on your phone to support the acoustic movement.
          </p>

          {/* Direct Open in UPI App to Pay Button */}
          <a
            href={`upi://pay?pa=${encodeURIComponent(SWARN_UPI_ID)}&pn=Swarn&cu=INR&tn=Support%20Swarn%20Music`}
            className="w-full py-3 px-4 text-xs font-bold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Open UPI App to Pay</span>
            <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Supported Apps Badges */}
          <div className="w-full pt-2 border-t border-[#DFCFC0]/60 text-center">
            <p className="text-[10px] text-stone-500 mb-2">
              Supported Payment Apps:
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap text-[10px] font-semibold text-stone-700">
              <span className="px-2 py-0.5 bg-white border border-[#DFCFC0] rounded">Google Pay</span>
              <span className="px-2 py-0.5 bg-white border border-[#DFCFC0] rounded">PhonePe</span>
              <span className="px-2 py-0.5 bg-white border border-[#DFCFC0] rounded">Paytm</span>
              <span className="px-2 py-0.5 bg-white border border-[#DFCFC0] rounded">BHIM / FamPay</span>
            </div>
          </div>

          <p className="text-[10px] text-stone-500 italic flex items-center justify-center gap-1 pt-1">
            <Heart size={11} className="text-[#7A131B] fill-current" />
            <span>Contributions directly fund Indian acoustic music talent on swarnmusic</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Small Floating "Swarn" Trigger Button
export const FloatingSwarnButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3 py-2 bg-[#2A1E14] hover:bg-[#3D2C1E] text-amber-300 border-2 border-amber-400/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95 group"
      title="Support Swarn via UPI QR or App"
      aria-label="Support Swarn via UPI"
    >
      {/* Golden Swarn Wing Logo Emblem */}
      <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
        <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-current">
          <path d="M50 15 C60 30, 80 40, 88 38 C75 52, 60 56, 52 56 C52 64, 46 76, 38 85 C38 72, 42 62, 45 56 C35 56, 20 48, 12 38 C22 40, 40 32, 50 15 Z" />
        </svg>
      </div>

      <span className="text-xs font-bold tracking-wide text-white group-hover:text-amber-200">
        Swarn
      </span>

      <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold bg-amber-400 text-stone-900 rounded-full">
        UPI
      </span>
    </button>
  );
};
