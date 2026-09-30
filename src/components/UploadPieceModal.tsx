import React, { useState } from 'react';
import { X, Upload, Music, FileText, CheckCircle, AlertCircle, Sparkles, HardDrive, ExternalLink } from 'lucide-react';
import { ArtistProfile, ArtistRole, MusicGenre, WorkPiece } from '../types';

interface UploadPieceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ArtistProfile;
  onSavePiece: (piece: WorkPiece) => void;
  onOpenGoogleDrive?: () => void;
}

const GENRE_LIST: MusicGenre[] = [
  'Indie Folk & Fusion',
  'Sufi & Ghazal',
  'Hindustani Classical',
  'Carnatic Classical',
  'Cinematic & Ambient',
  'Contemporary Bollywood',
  'Devotional & Spiritual',
  'Acoustic Lo-Fi',
];

export const UploadPieceModal: React.FC<UploadPieceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSavePiece,
  onOpenGoogleDrive,
}) => {
  const [title, setTitle] = useState('');
  const [roleAttributed, setRoleAttributed] = useState<ArtistRole>(currentUser.role);
  const [pieceType, setPieceType] = useState<'audio' | 'lyrics'>('audio');
  const [genre, setGenre] = useState<MusicGenre>('Indie Folk & Fusion');
  const [description, setDescription] = useState('');
  const [ragaOrMeter, setRagaOrMeter] = useState('');
  const [lyricsContent, setLyricsContent] = useState('');
  const [synthPreset, setSynthPreset] = useState<'bansuri' | 'sitar' | 'harmonium' | 'guitar' | 'tanpura'>('bansuri');
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFileName(file.name);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a title for your piece of work.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a short description or context for your work.');
      return;
    }
    if (pieceType === 'lyrics' && !lyricsContent.trim()) {
      setErrorMsg('Please enter your lyrical verses.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const newPiece: WorkPiece = {
      id: `work-user-${Date.now()}`,
      artistId: currentUser.id,
      title: title.trim(),
      roleAttributed,
      genre,
      type: pieceType,
      description: description.trim(),
      audioUrl: audioUrl || undefined,
      synthPreset: pieceType === 'audio' ? synthPreset : undefined,
      duration: pieceType === 'audio' ? '2:40' : undefined,
      lyricsContent: pieceType === 'lyrics' ? lyricsContent.trim() : undefined,
      ragaOrMeter: ragaOrMeter.trim() || undefined,
      coverImage: coverImageUrl || undefined,
      createdAt: 'Just now',
      ratingsCount: 0,
      averageRating: 5.0,
      reviews: [],
    };

    setTimeout(() => {
      onSavePiece(newPiece);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-xl border border-[#E5D9C8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5D9C8] bg-[#F5EFE6]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7A131B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Upload Work to Public Portfolio · New Submission
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-700 hover:text-stone-900 rounded-md hover:bg-[#EAE0D2] transition-colors cursor-pointer"
            aria-label="Close upload modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Drive Import Option */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-[#FAF3E8] border border-[#E5D9C8] rounded-lg gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E5D9C8] flex items-center justify-center shrink-0 shadow-2xs">
                <HardDrive size={16} className="text-[#7A131B]" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Have takes or lyrics in Google Drive?</div>
                <div className="text-[11px] text-stone-600">Import tracks (.mp3, .wav) or lyrics documents directly</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenGoogleDrive) onOpenGoogleDrive();
              }}
              className="px-3.5 py-1.5 bg-white border border-[#D3C7B5] hover:border-[#7A131B] text-xs font-semibold text-[#7A131B] hover:text-[#8C1620] rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs self-stretch sm:self-auto justify-center"
            >
              <span>Import from Google Drive</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Piece Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Type of Musical Piece:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPieceType('audio')}
                className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  pieceType === 'audio'
                    ? 'border-[#7A131B] bg-[#F7EEEE] text-[#7A131B]'
                    : 'border-[#E5D9C8] bg-white text-stone-700 hover:border-stone-400'
                }`}
              >
                <Music size={18} className="shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">Audio Piece / Alaap / Track</div>
                  <div className="text-[11px] text-stone-700">Upload audio file or use acoustic preset</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPieceType('lyrics')}
                className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  pieceType === 'lyrics'
                    ? 'border-[#7A131B] bg-[#F7EEEE] text-[#7A131B]'
                    : 'border-[#E5D9C8] bg-white text-stone-700 hover:border-stone-400'
                }`}
              >
                <FileText size={18} className="shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">Lyric Composition / Poetry</div>
                  <div className="text-[11px] text-stone-700">Nazm, ghazal, song verses & meters</div>
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-stone-800 mb-1">
              Title of Piece <span className="text-[#7A131B]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bageshri Midnight Alaap, Kaisi Yeh Dhoop, Sitar Prelude"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5D9C8] rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7A131B]"
              required
            />
          </div>

          {/* Role Attributed & Genre in 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-800 mb-1">
                Your Role for this Piece
              </label>
              <select
                value={roleAttributed}
                onChange={(e) => setRoleAttributed(e.target.value as ArtistRole)}
                className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7A131B]"
              >
                <option value="singer">Singer / Vocalist</option>
                <option value="composer">Composer / Producer</option>
                <option value="lyricist">Lyricist / Songwriter</option>
                <option value="instrumentalist">Instrumentalist</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-800 mb-1">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as MusicGenre)}
                className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7A131B]"
              >
                {GENRE_LIST.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Raga or Meter */}
          <div>
            <label className="block text-xs font-medium text-stone-800 mb-1">
              Raga / Meter / Key / Tempo (Optional)
            </label>
            <input
              type="text"
              value={ragaOrMeter}
              onChange={(e) => setRagaOrMeter(e.target.value)}
              placeholder="e.g. Raag Yaman · Jhaptal · 90 BPM or Urdu Bahr-e-Kamil"
              className="w-full px-3.5 py-2 bg-white border border-[#E5D9C8] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7A131B]"
            />
          </div>

          {/* Specific Inputs based on type */}
          {pieceType === 'audio' ? (
            <div className="p-4 bg-[#F5EFE6] rounded-lg border border-[#E5D9C8] space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Audio Sample or Acoustic Preset:
              </label>

              {/* Upload custom audio file */}
              <div className="flex items-center gap-3">
                <label className="px-3.5 py-2 text-xs font-semibold text-[#7A131B] bg-white border border-[#7A131B]/40 hover:bg-[#7A131B] hover:text-white rounded-md cursor-pointer transition-colors flex items-center gap-1.5">
                  <Upload size={14} />
                  <span>Choose Audio File (.mp3, .wav, .m4a)</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                  />
                </label>
                {audioFileName && (
                  <span className="text-xs text-stone-700 truncate max-w-xs flex items-center gap-1">
                    <CheckCircle size={13} className="text-emerald-700" />
                    <span>{audioFileName}</span>
                  </span>
                )}
              </div>

              {/* Procedural Acoustic Preset fallback */}
              <div>
                <span className="block text-[11px] text-stone-700 mb-1.5 font-medium">
                  Or select authentic acoustic synthesizer texture for instant playback:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { id: 'bansuri', label: 'Bansuri Flute' },
                    { id: 'sitar', label: 'Sitar Melody' },
                    { id: 'harmonium', label: 'Harmonium Warmth' },
                    { id: 'guitar', label: 'Acoustic Guitar' },
                    { id: 'tanpura', label: 'Tanpura Drone' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSynthPreset(preset.id as any)}
                      className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                        synthPreset === preset.id
                          ? 'bg-[#7A131B] text-white border-[#7A131B]'
                          : 'bg-white text-stone-700 border-[#E5D9C8] hover:border-stone-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-stone-800 mb-1">
                Lyrics / Poetry Content <span className="text-[#7A131B]">*</span>
              </label>
              <textarea
                rows={5}
                value={lyricsContent}
                onChange={(e) => setLyricsContent(e.target.value)}
                placeholder="Write your verses here in Hindi, Urdu, English, Punjabi, or your native language..."
                className="w-full p-3 bg-white border border-[#E5D9C8] rounded-md text-xs sm:text-sm font-serif text-stone-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7A131B]"
                required
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-stone-800 mb-1">
              Description / Notes for Collaborators <span className="text-[#7A131B]">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the mood, background story, and what kind of collaborator you are seeking..."
              className="w-full p-3 bg-white border border-[#E5D9C8] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7A131B]"
              required
            />
          </div>

          {/* Optional Picture Upload for Piece */}
          <div>
            <label className="block text-xs font-medium text-stone-800 mb-1">
              Cover Artwork / Picture (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="px-3 py-1.5 text-xs text-stone-700 bg-white border border-[#E5D9C8] hover:border-stone-400 rounded cursor-pointer">
                <span>Upload Artwork</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt="Preview"
                  className="w-10 h-10 rounded object-cover border border-[#E5D9C8]"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E5D9C8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing to Portfolio...' : 'Publish to Public Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
