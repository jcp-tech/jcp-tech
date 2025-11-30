export function renderMainForm(data) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <h2 class="text-2xl font-bold text-white mb-6">Edit Main Section</h2>
        <form id="edit-form" onsubmit="handleSave(event)" class="space-y-6 max-w-2xl">
            <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input type="text" name="FULL_NAME" value="${data.FULL_NAME || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Profile Icon URL</label>
                <div class="flex space-x-6 items-start">
                    <div class="flex-1">
                        <input type="text" 
                               name="PROFILE_ICON_URL" 
                               value="${data.PROFILE_ICON_URL || ''}" 
                               oninput="updateImagePreview(this.value)"
                               class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                               placeholder="https://example.com/image.jpg">
                        <p class="text-xs text-gray-500 mt-2">Enter a valid image URL. The preview will update automatically.</p>
                    </div>
                    <div class="flex-shrink-0">
                        <div class="w-24 h-24 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center overflow-hidden relative">
                            <img id="profile-preview" 
                                 src="${data.PROFILE_ICON_URL || ''}" 
                                 alt="Preview" 
                                 class="w-full h-full object-cover ${data.PROFILE_ICON_URL ? '' : 'hidden'}"
                                 onerror="this.classList.add('hidden'); document.getElementById('preview-placeholder').classList.remove('hidden');">
                            <div id="preview-placeholder" class="absolute inset-0 flex items-center justify-center text-xs text-gray-500 text-center p-2 ${data.PROFILE_ICON_URL ? 'hidden' : ''}">
                                No Image
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 text-center mt-1">Preview</p>
                    </div>
                </div>
            </div>
            <div class="flex items-center">
                <input type="checkbox" name="PROFILE_ICON_FLAG" id="flag" ${data.PROFILE_ICON_FLAG ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                <label for="flag" class="ml-2 text-sm font-medium text-gray-400">Show Profile Icon</label>
            </div>
            
            <div class="border-t border-gray-700 pt-6 mt-6">
                <h3 class="text-lg font-bold text-white mb-4">Resume Upload</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-400">Current Resume</p>
                            ${data.resume_last_updated ? `<p class="text-xs text-gray-500 mt-1">Last Updated: ${new Date(data.resume_last_updated).toLocaleString()}</p>` : ''}
                        </div>
                        <a href="/media/pdfs/Jonathan Chacko - Resume.pdf" target="_blank" class="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                            <span class="material-symbols-outlined text-lg mr-1">download</span>
                            Download Current Resume
                        </a>
                    </div>
                    
                    <div class="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer" id="drop-zone">
                        <input type="file" id="resume-upload" class="hidden" accept=".pdf">
                        <div class="space-y-2">
                            <span class="material-symbols-outlined text-4xl text-gray-500">cloud_upload</span>
                            <p class="text-gray-300 font-medium">Click to upload or drag and drop</p>
                            <p class="text-xs text-gray-500">PDF files only</p>
                        </div>
                    </div>
                    <div id="upload-status" class="hidden">
                        <div class="w-full bg-gray-700 rounded-full h-2.5">
                            <div class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
                        </div>
                        <p class="text-xs text-gray-400 mt-1 text-center">Uploading...</p>
                    </div>
                </div>
            </div>

            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
                Save Changes
            </button>
        </form>
    `;

    // Resume Upload Logic
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('resume-upload');
    const uploadStatus = document.getElementById('upload-status');
    const progressBar = uploadStatus.querySelector('div > div');
    const statusText = uploadStatus.querySelector('p');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-blue-500');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-blue-500');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-blue-500');
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    async function handleFileUpload(file) {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        uploadStatus.classList.remove('hidden');
        progressBar.style.width = '0%';
        statusText.textContent = 'Uploading...';

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/admin/api/upload-resume', true);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progressBar.style.width = percentComplete + '%';
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    statusText.textContent = 'Upload complete!';
                    statusText.classList.add('text-green-500');
                    setTimeout(() => {
                        uploadStatus.classList.add('hidden');
                        statusText.classList.remove('text-green-500');
                    }, 3000);
                } else {
                    statusText.textContent = 'Upload failed.';
                    statusText.classList.add('text-red-500');
                }
            };

            xhr.onerror = () => {
                statusText.textContent = 'Upload failed.';
                statusText.classList.add('text-red-500');
            };

            xhr.send(formData);
        } catch (error) {
            console.error('Upload error:', error);
            statusText.textContent = 'Upload failed.';
            statusText.classList.add('text-red-500');
        }
    }
}

export function updateImagePreview(url) {
    const img = document.getElementById('profile-preview');
    const placeholder = document.getElementById('preview-placeholder');
    
    if (url) {
        img.src = url;
        img.classList.remove('hidden');
        placeholder.classList.add('hidden');
    } else {
        img.src = '';
        img.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }
}

// Attach to window for inline event handlers
window.updateImagePreview = updateImagePreview;
