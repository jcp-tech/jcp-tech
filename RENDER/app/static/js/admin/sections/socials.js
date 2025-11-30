export function renderSocials(data) {
    const contentArea = document.getElementById('content-area');
    // Ensure data is an array
    const items = Array.isArray(data) ? data : [];
    
    const itemsHtml = items.map((item, index) => generateSocialItemHtml(item, index)).join('');

    contentArea.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-white">Edit Socials</h2>
            <button onclick="addSocialItem()" type="button" class="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors">
                + Add Item
            </button>
        </div>
        <form id="edit-form" onsubmit="handleSave(event)" class="space-y-6 max-w-3xl">
            <div id="social-items" class="space-y-4">
                ${itemsHtml}
            </div>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
                Save Changes
            </button>
        </form>
    `;

    // Initialize Sortable
    const el = document.getElementById('social-items');
    Sortable.create(el, {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'bg-gray-700'
    });
}

function generateSocialItemHtml(item, index) {
    return `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <!-- Drag Handle -->
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            
            <!-- Fields -->
            <div class="flex-1 grid grid-cols-1 gap-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Name</label>
                        <input type="text" data-field="name" value="${item.name || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Link</label>
                        <input type="text" data-field="link" value="${item.link || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">SVG Icon</label>
                    <textarea data-field="svg_icon" rows="3" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500 font-mono text-xs" oninput="updateSvgPreview(this)">${item.svg_icon || ''}</textarea>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="svg-preview w-8 h-8 flex items-center justify-center text-gray-400 border border-gray-600 rounded bg-gray-900">
                            ${item.svg_icon || ''}
                        </div>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" data-field="active" ${item.active ? 'checked' : ''} class="form-checkbox text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                            <span class="text-sm text-gray-400">Active</span>
                        </label>
                    </div>
                    <button type="button" onclick="this.closest('.group').remove()" class="text-red-500 hover:text-red-400 text-sm">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function addSocialItem() {
    const container = document.getElementById('social-items');
    const newItem = { name: 'New Social', link: '#', svg_icon: '', active: true };
    const html = generateSocialItemHtml(newItem, container.children.length);
    container.insertAdjacentHTML('beforeend', html);
}

export function updateSvgPreview(textarea) {
    const preview = textarea.closest('.grid').querySelector('.svg-preview');
    if (preview) {
        preview.innerHTML = textarea.value;
    }
}

// Attach to window
window.addSocialItem = addSocialItem;
window.updateSvgPreview = updateSvgPreview;
