// Memory content card component that displays the uploader, time, and specific content (image, video, or text), with delete functionality.
import React, { useEffect, useState } from 'react';
import { Memory } from './Timeline';

interface MemoryCardProps {
    memory: Memory;
    onDeleteMemory: (id: string) => void;
    canDelete?: boolean;
}

// Default image, used for display when image loading fails or the URL is empty
const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Cpath d="M30,40 L70,40 L70,60 L30,60 Z" fill="%23ddd"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="8" text-anchor="middle" alignment-baseline="middle" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';

const MemoryCard: React.FC<MemoryCardProps> = ({
    memory,
    onDeleteMemory,
    canDelete = false
}) => {
    const [isNew, setIsNew] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [videoError, setVideoError] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);

    /* Entry animation, runs only once on initial mount */
    useEffect(() => {
        const timer = setTimeout(() => setIsNew(false), 500);
        return () => clearTimeout(timer);
    }, []);

    /* Fix the path and handle the urls of images and videos */
    useEffect(() => {
        if (memory.type === 'image') {

            setImageError(false);
            setAttemptCount(0);

            processMediaUrl(memory.preview, 'image');
        } else if (memory.type === 'video') {

            setVideoError(false);
            setAttemptCount(0);

            processMediaUrl(memory.preview, 'video');
        }
    }, [memory]);

    // Media URL processing function - Uniformly handle image and video urls
    const processMediaUrl = (originalUrl: string, mediaType: 'image' | 'video') => {
        try {
            // If the URL is empty or invalid, display an error
            if (!originalUrl || originalUrl.trim() === '') {
                console.error(`Empty or invalid ${mediaType} URL`);
                if (mediaType === 'image') {
                    setImageSrc(DEFAULT_IMAGE);
                    setImageError(true);
                } else {
                    setVideoSrc(null);
                    setVideoError(true);
                }
                return;
            }

            // Clean up and standardize urls
            let processedUrl = originalUrl.trim();
            processedUrl = processedUrl.replace(/\\/g, '/');
            if (processedUrl.startsWith('blob:') || processedUrl.startsWith('data:')) {
                console.log(`Using direct blob/data URL for ${mediaType}:`, processedUrl);
                if (mediaType === 'image') {
                    setImageSrc(processedUrl);
                } else {
                    setVideoSrc(processedUrl);
                }
                return;
            }

            // 3. Relative path processing
            if (!processedUrl.startsWith('http')) {

                const baseUrlWithApi = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                const baseUrl = baseUrlWithApi.replace(/\/api$/, '');

                processedUrl = processedUrl
                    .replace(/^server\/uploads\//, '')
                    .replace(/^uploads\//, '');

                // Make sure that the processed URL is not empty
                if (!processedUrl || processedUrl === '') {
                    console.error(`Invalid ${mediaType} path after processing`);
                    if (mediaType === 'image') {
                        setImageSrc(DEFAULT_IMAGE);
                        setImageError(true);
                    } else {
                        setVideoSrc(null);
                        setVideoError(true);
                    }
                    return;
                }

                // Build different URL options and attempt to load
                const options = [
                    `${baseUrl}/uploads/${processedUrl}`,
                    `${baseUrlWithApi}/uploads/${processedUrl}`,
                    `http://localhost:5001/uploads/${processedUrl}`
                ];

                if (mediaType === 'image') {
                    loadImageWithFallbacks(options);
                } else {
                    loadVideoWithFallbacks(options);
                }
                return;
            }

            // 4. It's already an HTTP URL but the format might be incorrect

            if (processedUrl.includes('/api/uploads/')) {
                processedUrl = processedUrl.replace('/api/uploads/', '/uploads/');
            }

            if (mediaType === 'image') {
                setImageSrc(processedUrl);
            } else {
                setVideoSrc(processedUrl);
            }
            console.log(`Using provided HTTP URL for ${mediaType}:`, processedUrl);
        } catch (err) {
            console.error(`Error processing ${mediaType} URL:`, err);
            if (mediaType === 'image') {
                setImageSrc(DEFAULT_IMAGE);
                setImageError(true);
            } else {
                setVideoSrc(null);
                setVideoError(true);
            }
        }
    };

    // Try loading images from multiple urls
    const loadImageWithFallbacks = (urlOptions: string[]) => {
        const currentOption = attemptCount < urlOptions.length ? urlOptions[attemptCount] : null;

        if (!currentOption) {
            console.error('All URL options failed, using default image');
            setImageSrc(DEFAULT_IMAGE);
            setImageError(true);
            return;
        }

        console.log(`Trying URL option ${attemptCount + 1}/${urlOptions.length}:`, currentOption);
        setImageSrc(currentOption);
    };

    // Try loading the video with multiple urls
    const loadVideoWithFallbacks = (urlOptions: string[]) => {
        const currentOption = attemptCount < urlOptions.length ? urlOptions[attemptCount] : null;

        if (!currentOption) {
            console.error('All video URL options failed');
            setVideoSrc(null);
            setVideoError(true);
            return;
        }

        console.log(`Trying video URL option ${attemptCount + 1}/${urlOptions.length}:`, currentOption);
        setVideoSrc(currentOption);
    };

    // The image loading was successfully processed
    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        try {
            const img = event.currentTarget;
            console.log('Image loaded successfully:', imageSrc);

            // Calculate the appropriate size
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }

            setImageSize({ width, height });
            setImageError(false);
        } catch (err) {
            console.error('Error in image load handler:', err);
        }
    };

    // Image loading failed handling
    const handleImageError = () => {

        if (imageSrc === DEFAULT_IMAGE) return;

        console.error('Failed to load image:', imageSrc);

        // Try the next URL option
        const nextAttempt = attemptCount + 1;
        if (nextAttempt < 5) {
            setAttemptCount(nextAttempt);


            if (nextAttempt === 1) {

                if (imageSrc && imageSrc.includes('/api/uploads/')) {
                    const altUrl = imageSrc.replace('/api/uploads/', '/uploads/');
                    console.log('Trying URL without /api prefix:', altUrl);
                    setImageSrc(altUrl);
                    return;
                }


                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '');
                const fileName = imageSrc && imageSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `${baseUrl}/uploads/${fileName}`;
                    console.log('Trying alternative URL format:', altUrl);
                    setImageSrc(altUrl);
                }
            } else if (nextAttempt === 2) {

                const fileName = imageSrc && imageSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `http://localhost:5001/uploads/${fileName}`;
                    console.log('Trying localhost URL:', altUrl);
                    setImageSrc(altUrl);
                }
            } else if (nextAttempt === 3) {

                const fileName = imageSrc && imageSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `http://localhost:5001/api/uploads/${fileName}`;
                    console.log('Trying localhost API URL:', altUrl);
                    setImageSrc(altUrl);
                }
            } else {

                console.log('Trying original URL as fallback');
                const originalFixed = memory.preview && memory.preview.replace(/\\/g, '/');
                if (originalFixed) {
                    setImageSrc(originalFixed);
                } else {
                    setImageSrc(DEFAULT_IMAGE);
                    setImageError(true);
                }
            }
        } else {

            console.error('All image loading attempts failed, using default image');
            setImageSrc(DEFAULT_IMAGE);
            setImageError(true);
        }
    };

    // Video loading error handling
    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error('Video error:', e);


        const nextAttempt = attemptCount + 1;
        if (nextAttempt < 5) {
            setAttemptCount(nextAttempt);

            // Build a backup URL
            if (nextAttempt === 1) {

                if (videoSrc && videoSrc.includes('/api/uploads/')) {
                    const altUrl = videoSrc.replace('/api/uploads/', '/uploads/');
                    console.log('Trying video URL without /api prefix:', altUrl);
                    setVideoSrc(altUrl);
                    return;
                }

                // Try the path without /api
                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '');
                const fileName = videoSrc && videoSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `${baseUrl}/uploads/${fileName}`;
                    console.log('Trying alternative video URL format:', altUrl);
                    setVideoSrc(altUrl);
                }
            } else if (nextAttempt === 2) {
                // Try using localhost directly
                const fileName = videoSrc && videoSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `http://localhost:5001/uploads/${fileName}`;
                    console.log('Trying localhost video URL:', altUrl);
                    setVideoSrc(altUrl);
                }
            } else if (nextAttempt === 3) {
                // Try to use localhost directly and add /api
                const fileName = videoSrc && videoSrc.split('/').pop();
                if (fileName) {
                    const altUrl = `http://localhost:5001/api/uploads/${fileName}`;
                    console.log('Trying localhost API video URL:', altUrl);
                    setVideoSrc(altUrl);
                }
            } else {
                // Finally, try the original URL
                console.log('Trying original video URL as fallback');
                const originalFixed = memory.preview && memory.preview.replace(/\\/g, '/');
                if (originalFixed) {
                    setVideoSrc(originalFixed);
                } else {
                    setVideoSrc(null);
                    setVideoError(true);
                }
            }
        } else {
            // All attempts failed
            console.error('All video loading attempts failed');
            setVideoSrc(null);
            setVideoError(true);
        }
    };

    const formatDate = (date: Date) =>
        date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (
            window.confirm(
                'Are you sure you want to delete this memory? This action cannot be undone.',
            )
        ) {
            setIsDeleting(true);
            onDeleteMemory(memory.id);
        }
    };

    const renderContent = () => {
        switch (memory.type) {
            case 'image':
                return (
                    <div className="mt-3 flex justify-center">
                        {imageError ? (
                            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                                <p>Failed to load image</p>
                                <p className="text-xs overflow-auto max-w-md">{memory.preview || 'No image URL'}</p>
                                {imageSrc && imageSrc !== DEFAULT_IMAGE && imageSrc !== memory.preview && (
                                    <p className="text-xs overflow-auto max-w-md">Tried: {imageSrc}</p>
                                )}
                                <button
                                    className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                                    onClick={() => imageSrc && window.open(imageSrc, '_blank')}
                                    disabled={!imageSrc || imageSrc === DEFAULT_IMAGE}
                                >
                                    Open the picture link
                                </button>
                                <button
                                    className="mt-2 ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded"
                                    onClick={() => {
                                        setImageError(false);
                                        setAttemptCount(0);
                                        processMediaUrl(memory.preview, 'image');
                                    }}
                                >
                                    Retry loading
                                </button>
                            </div>
                        ) : (
                            //Render images only when imageSrc has a value to avoid empty src warnings
                            imageSrc && (
                                <img
                                    src={imageSrc}
                                    alt="Memory"
                                    className="rounded-lg"
                                    style={{
                                        width: imageSize.width || 'auto',
                                        height: imageSize.height || 'auto',
                                        maxWidth: '100%',
                                        objectFit: 'contain'
                                    }}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                            )
                        )}
                    </div>
                );
            case 'video':
                return (
                    <div className="mt-3 flex justify-center">
                        {videoError ? (
                            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                                <p>Unable to load the video</p>
                                <p className="text-xs overflow-auto max-w-md">{memory.preview || '没有视频URL'}</p>
                                {videoSrc && videoSrc !== memory.preview && (
                                    <p className="text-xs overflow-auto max-w-md">尝试过: {videoSrc}</p>
                                )}
                                <button
                                    className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                                    onClick={() => videoSrc && window.open(videoSrc, '_blank')}
                                    disabled={!videoSrc}
                                >
                                    Open the video link
                                </button>
                                <button
                                    className="mt-2 ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded"
                                    onClick={() => {
                                        setVideoError(false);
                                        setAttemptCount(0);
                                        processMediaUrl(memory.preview, 'video');
                                    }}
                                >
                                    Retry loading
                                </button>
                            </div>
                        ) : (
                            videoSrc ? (
                                <video
                                    src={videoSrc}
                                    controls
                                    className="mt-3 w-full h-auto rounded-lg"
                                    onError={handleVideoError}
                                />
                            ) : null
                        )}
                    </div>
                );
            default: // 'text'
                return (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg text-gray-700">
                        {memory.preview}
                    </div>
                );
        }
    };

    return (
        <div
            className={`border border-gray-200 rounded-lg shadow-sm p-5 bg-white ${isNew ? 'memory-card-new' : ''
                } ${isDeleting ? 'opacity-50' : ''}`}
        >
            {/* Header: avatar + uploader + time */}
            <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white">
                    <span>
                        {(memory.uploaderName || 'U').charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="ml-3 timeline-dot">
                    <p className="font-medium">
                        {memory.uploaderName || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">
                        {formatDate(memory.uploadTime)}
                    </p>
                </div>
            </div>

            {/* Display the memory ID and type for debugging */}
            <div className="text-xs text-gray-400 mt-1 mb-2">
                ID: {memory.id} | Type: {memory.type}
            </div>

            {/* Main content (image / video / text) */}
            {renderContent()}

            {/* Delete button, shown only when canDelete is true */}
            {canDelete && (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="mt-4 w-full py-2 rounded bg-gray-700 text-white font-semibold disabled:opacity-60 hover:bg-gray-800"
                >
                    DELETE THIS MEMORY
                </button>
            )}
        </div>
    );
};

export default MemoryCard;
