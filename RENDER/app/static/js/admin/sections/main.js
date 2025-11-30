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
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
                Save Changes
            </button>
        </form>
    `;
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
