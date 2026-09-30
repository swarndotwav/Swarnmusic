import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Music,
  FileText,
  File,
  Trash2,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import {
  googleSignIn,
  logoutGoogle,
  initAuth,
  getAccessToken,
} from '../services/googleDriveAuth';
import {
  listDriveFiles,
  DriveFileItem,
  isAudioMime,
  isLyricsOrDocMime,
  fetchDriveFileContent,
  uploadToDrive,
  deleteFromDrive,
} from '../services/googleDriveService';
import { ArtistProfile, WorkPiece } from '../types';

interface GoogleDriveHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ArtistProfile | null;
  onImportPieceToPortfolio?: (piece: WorkPiece) => void;
}

export const GoogleDriveHubModal: React.FC<GoogleDriveHubModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onImportPieceToPortfolio,
}) => {
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileCategory, setFileCategory] = useState<'all' | 'audio' | 'lyrics'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Delete confirmation modal state (MANDATORY per skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Uploading state
  const [uploadName, setUploadName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadType, setUploadType] = useState<'lyrics' | 'audio'>('lyrics');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setHasToken(!!token);
        loadFiles(token);
      },
      () => {
        setGoogleUser(null);
        setHasToken(false);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadFiles = async (tokenOverride?: string) => {
    setIsLoadingFiles(true);
    setErrorMessage('');
    try {
      const driveFiles = await listDriveFiles(fileCategory);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Error loading Google Drive files:', err);
      setErrorMessage(err.message || 'Unable to list Google Drive files');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (hasToken) {
      loadFiles();
    }
  }, [fileCategory, hasToken]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setErrorMessage('');
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setHasToken(true);
        setStatusFeedback('Connected to Google Drive successfully!');
        setTimeout(() => setStatusFeedback(''), 3500);
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setErrorMessage(err.message || 'Google Sign In failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setHasToken(false);
    setFiles([]);
  };

  const handleImportToPortfolio = async (file: DriveFileItem) => {
    if (!currentUser) {
      setErrorMessage('Please create an artist profile on swarnmusic first to import into your portfolio.');
      return;
    }

    try {
      setStatusFeedback(`Importing "${file.name}" from Google Drive...`);
      const isAudio = isAudioMime(file.mimeType, file.name);

      let importedPiece: WorkPiece;

      if (isAudio) {
        // Fetch audio content as blob URL
        const blob = await fetchDriveFileContent(file.id);
        const objectUrl = URL.createObjectURL(blob);

        importedPiece = {
          id: `work-drive-${Date.now()}`,
          artistId: currentUser.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          roleAttributed: currentUser.role,
          genre: 'Indie Folk & Fusion',
          type: 'audio',
          audioUrl: objectUrl,
          description: `Imported directly from Google Drive (${file.name})`,
          duration: '3:15',
          ratingsCount: 0,
          averageRating: 5.0,
          reviews: [],
          createdAt: 'Just now',
          synthPreset: 'guitar',
        };
      } else {
        // Text / lyrics
        const blob = await fetchDriveFileContent(file.id);
        const textContent = await blob.text();

        importedPiece = {
          id: `work-drive-${Date.now()}`,
          artistId: currentUser.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          roleAttributed: 'lyricist',
          genre: 'Sufi & Ghazal',
          type: 'lyrics',
          lyricsContent: textContent || 'Original lyrics imported from Google Drive',
          description: `Lyrics file imported from Google Drive (${file.name})`,
          ratingsCount: 0,
          averageRating: 5.0,
          reviews: [],
          createdAt: 'Just now',
        };
      }

      if (onImportPieceToPortfolio) {
        onImportPieceToPortfolio(importedPiece);
      }

      setStatusFeedback(`Successfully imported "${importedPiece.title}" into your public portfolio!`);
      setTimeout(() => setStatusFeedback(''), 4500);
    } catch (err: any) {
      console.error('Import error:', err);
      setErrorMessage(`Failed to import from Drive: ${err.message}`);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    setErrorMessage('');
    try {
      await deleteFromDrive(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setStatusFeedback(`Permanently deleted "${fileToDelete.name}" from your Google Drive.`);
      setTimeout(() => setStatusFeedback(''), 4000);
      setFileToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setErrorMessage(`Failed to delete file from Drive: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) return;

    setIsUploading(true);
    setErrorMessage('');

    try {
      const fileName = uploadType === 'lyrics'
        ? (uploadName.endsWith('.txt') ? uploadName : `${uploadName}.txt`)
        : uploadName;
      const mime = uploadType === 'lyrics' ? 'text/plain' : 'audio/mpeg';

      await uploadToDrive(fileName, mime, uploadContent, 'Uploaded via swarnmusic');
      setStatusFeedback(`Uploaded "${fileName}" directly to your Google Drive!`);
      setTimeout(() => setStatusFeedback(''), 4000);
      setUploadName('');
      setUploadContent('');
      setShowUploadForm(false);
      loadFiles();
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(`Failed to upload to Drive: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFiles = files.filter((f) => {
    if (!searchFilter.trim()) return true;
    return f.name.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-xl border border-[#E5D9C8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5D9C8] bg-[#F5EFE6]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E5D9C8] flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 87.3 78" className="w-5 h-5">
                <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44A9.06 9.06 0 0 0 0 53h27.5z" fill="#00ac47"/>
                <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#ea4335"/>
                <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.4-4.5 1.2z" fill="#00832d"/>
                <path d="M59.8 53h27.5c0-1.55-.4-3.1-1.2-4.5L62.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L45.65 25z" fill="#ffba00"/>
                <path d="M73.55 76.8H27.5L13.75 53h59.8c1.6 0 3.15.4 4.5 1.2 1.35.8 2.5 1.9 3.3 3.3z" fill="#2684fc"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>Google Drive Studio Hub</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  Workspace
                </span>
              </h3>
              <p className="text-xs text-stone-600">
                Browse audio tracks, import original lyrics, and back up your portfolio directly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-700 hover:text-stone-900 rounded-md hover:bg-[#EAE0D2] transition-colors cursor-pointer"
            aria-label="Close Google Drive Hub"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status / Feedback Banner */}
        {statusFeedback && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {errorMessage && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* SECTION 1: AUTHENTICATION STATE */}
          {!hasToken ? (
            <div className="p-8 text-center bg-[#F5EFE6] rounded-xl border border-[#E5D9C8] space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-[#E5D9C8]">
                <HardDrive className="w-7 h-7 text-[#7A131B]" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-stone-900">Connect Your Google Drive</h4>
                <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto leading-relaxed">
                  Authenticate with Google to browse and import your audio takes (.mp3, .wav), lyrics documents, and musical arrangements directly into your swarnmusic portfolio.
                </p>
              </div>

              {/* Official Google Sign-In button specification */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="px-5 py-2.5 bg-white border border-[#D3C7B5] hover:border-[#7A131B] hover:shadow-md rounded-lg text-xs font-semibold text-stone-800 transition-all flex items-center gap-3 cursor-pointer"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="text-[11px] text-stone-500 pt-1">
                Access tokens are cached safely in browser memory and discarded on logout.
              </div>
            </div>
          ) : (
            /* CONNECTED USER STRIP */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#F5EFE6] rounded-lg border border-[#E5D9C8]">
                <div className="flex items-center gap-3">
                  {googleUser?.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt="Google account"
                      className="w-10 h-10 rounded-full border border-[#E5D9C8]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#7A131B] text-white flex items-center justify-center font-bold text-sm">
                      {googleUser?.displayName?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{googleUser?.displayName || 'Google Drive User'}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-[11px] text-stone-600 font-mono">{googleUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-[#7A131B] bg-white border border-[#E5D9C8] hover:border-[#7A131B] rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Upload size={13} />
                    <span>Upload to Drive</span>
                  </button>

                  <button
                    onClick={() => loadFiles()}
                    disabled={isLoadingFiles}
                    className="p-1.5 text-stone-700 hover:text-stone-900 bg-white border border-[#E5D9C8] rounded hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    title="Refresh files"
                  >
                    <RefreshCw size={14} className={isLoadingFiles ? 'animate-spin' : ''} />
                  </button>

                  <button
                    onClick={handleGoogleLogout}
                    className="px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-white border border-[#E5D9C8] rounded hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* OPTIONAL UPLOAD FORM TO DRIVE */}
              {showUploadForm && (
                <div className="p-4 bg-white rounded-lg border border-[#E5D9C8] space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Upload size={13} className="text-[#7A131B]" />
                      <span>Upload New Item to Google Drive</span>
                    </span>
                    <button
                      onClick={() => setShowUploadForm(false)}
                      className="text-stone-500 hover:text-stone-800 text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleUploadSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-800 mb-1">
                          File Name
                        </label>
                        <input
                          type="text"
                          value={uploadName}
                          onChange={(e) => setUploadName(e.target.value)}
                          placeholder="e.g. Raag Bhairav Vocal Take 1"
                          className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-800 mb-1">
                          Category
                        </label>
                        <select
                          value={uploadType}
                          onChange={(e) => setUploadType(e.target.value as any)}
                          className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E5D9C8] rounded text-xs text-stone-900"
                        >
                          <option value="lyrics">Lyrics & Songwriting Notes (.txt)</option>
                          <option value="audio">Audio Reference</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-800 mb-1">
                        Content / Notes / Lyrics
                      </label>
                      <textarea
                        rows={3}
                        value={uploadContent}
                        onChange={(e) => setUploadContent(e.target.value)}
                        placeholder="Paste original verse, melodic notes, raga scale, or chords to save to your Google Drive..."
                        className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E5D9C8] rounded text-xs text-stone-900 font-mono"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded transition-colors cursor-pointer"
                      >
                        {isUploading ? 'Uploading to Drive...' : 'Save File to Drive'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SEARCH & CATEGORY FILTER */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="inline-flex p-1 bg-[#EBE3D7] rounded-lg gap-1 text-xs font-medium">
                  {[
                    { id: 'all', label: 'All Drive Files' },
                    { id: 'audio', label: 'Audio Tracks' },
                    { id: 'lyrics', label: 'Lyrics & Docs' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFileCategory(tab.id as any)}
                      className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                        fileCategory === tab.id
                          ? 'bg-white text-[#7A131B] font-semibold shadow-xs'
                          : 'text-stone-700 hover:text-stone-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search in Drive files..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  />
                </div>
              </div>

              {/* FILE LIST */}
              {isLoadingFiles ? (
                <div className="p-12 text-center text-xs text-stone-600 space-y-2">
                  <RefreshCw className="w-6 h-6 text-[#7A131B] animate-spin mx-auto" />
                  <p>Fetching files from your Google Drive...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-8 text-center bg-[#F5EFE6] rounded-xl border border-[#E5D9C8] space-y-2">
                  <FolderOpen className="w-8 h-8 text-stone-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-stone-800">No files found</h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto">
                    No files found matching the selected filter in your Google Drive. You can upload an audio take or lyrics doc above.
                  </p>
                </div>
              ) : (
                <div className="border border-[#E5D9C8] rounded-xl overflow-hidden divide-y divide-[#E5D9C8] bg-white">
                  {filteredFiles.map((file) => {
                    const isAudio = isAudioMime(file.mimeType, file.name);
                    const isDoc = isLyricsOrDocMime(file.mimeType, file.name);

                    return (
                      <div
                        key={file.id}
                        className="p-3.5 hover:bg-[#FAF7F2] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                              isAudio
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : isDoc
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-stone-50 text-stone-700 border-stone-200'
                            }`}
                          >
                            {isAudio ? (
                              <Music size={16} />
                            ) : isDoc ? (
                              <FileText size={16} />
                            ) : (
                              <File size={16} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-stone-900 truncate" title={file.name}>
                              {file.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                              <span>{isAudio ? 'Audio Take' : isDoc ? 'Lyrics / Document' : 'File'}</span>
                              <span>·</span>
                              <span>
                                {file.size ? `${(parseInt(file.size, 10) / (1024 * 1024)).toFixed(2)} MB` : 'Cloud Doc'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {/* 1. Import to Portfolio */}
                          <button
                            onClick={() => handleImportToPortfolio(file)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded transition-colors cursor-pointer flex items-center gap-1"
                            title="Import piece into your public swarnmusic portfolio"
                          >
                            <Sparkles size={11} />
                            <span>Import to Portfolio</span>
                          </button>

                          {/* 2. Open in Drive */}
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-[#EBE2D5] transition-colors"
                              title="Open in Google Drive"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}

                          {/* 3. Delete from Drive with Confirmation Dialog (MANDATORY per skill) */}
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 text-stone-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete file from Google Drive"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MANDATORY USER CONFIRMATION DIALOG FOR DESTRUCTIVE OPERATIONS */}
        <AnimatePresence>
          {fileToDelete && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-xl border border-red-200 shadow-2xl p-6 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-stone-900">
                      Delete File from Google Drive?
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Are you sure you want to permanently delete{' '}
                      <strong className="text-stone-900">"{fileToDelete.name}"</strong> from your Google Drive?
                      This action mutates your Drive storage and cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg text-xs font-mono text-stone-700 border border-stone-200 truncate">
                  Item ID: {fileToDelete.id}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFileToDelete(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteFile}
                    disabled={isDeleting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{isDeleting ? 'Deleting from Drive...' : 'Yes, Delete from Drive'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
