export function renderAchievements(data) {
    const contentArea = document.getElementById('content-area');
    const items = Array.isArray(data) ? data : [];
    
    const itemsHtml = items.map((item, index) => `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Title</label>
                    <input type="text" data-field="title" value="${item.title || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Date</label>
                    <input type="text" data-field="date" value="${item.date || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea data-field="description" rows="2" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">${item.description || ''}</textarea>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Icon (URL or Material Name)</label>
                    <div class="flex items-center space-x-2">
                        <input type="text" data-field="icon" value="${item.icon || ''}" 
                            oninput="
                                const val = this.value;
                                const img = this.nextElementSibling;
                                const span = img.nextElementSibling;
                                if (val.startsWith('http') || val.startsWith('/')) {
                                    img.src = val;
                                    img.style.display = 'block';
                                    span.style.display = 'none';
                                } else {
                                    img.style.display = 'none';
                                    span.textContent = val || 'emoji_events';
                                    span.style.display = 'block';
                                }
                            " 
                            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                        <div class="h-16 w-16 bg-gray-900 rounded border border-gray-700 overflow-hidden flex items-center justify-center">
                            <img src="${item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? item.icon : ''}" 
                                 class="h-full w-full object-contain" 
                                 style="display: ${item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? 'block' : 'none'}" 
                                 onerror="this.style.display='none'">
                            <span class="material-icons text-white text-3xl" 
                                  style="display: ${item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? 'none' : 'block'}">
                                ${item.icon && !(item.icon.startsWith('http') || item.icon.startsWith('/')) ? item.icon : 'emoji_events'}
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Link</label>
                    <input type="text" data-field="link" value="${item.link || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>

            </div>
            <button type="button" onclick="this.closest('.group').remove()" class="text-red-500 hover:text-red-400 text-sm mt-2">
                Delete
            </button>
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-white">Edit Achievements</h2>
            <button onclick="addAchievementItem()" type="button" class="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors">
                + Add Achievement
            </button>
        </div>
        <form id="edit-form" onsubmit="handleSave(event)" class="space-y-6 max-w-4xl">
            <div id="achievement-items" class="space-y-4">
                ${itemsHtml}
            </div>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
                Save Changes
            </button>
        </form>
    `;

    Sortable.create(document.getElementById('achievement-items'), {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'bg-gray-700'
    });
}

export function addAchievementItem() {
    const container = document.getElementById('achievement-items');
    const html = `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Title</label>
                    <input type="text" data-field="title" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Date</label>
                    <input type="text" data-field="date" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea data-field="description" rows="2" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"></textarea>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Icon (URL or Material Name)</label>
                    <div class="flex items-center space-x-2">
                        <input type="text" data-field="icon" 
                            oninput="
                                const val = this.value;
                                const img = this.nextElementSibling;
                                const span = img.nextElementSibling;
                                if (val.startsWith('http') || val.startsWith('/')) {
                                    img.src = val;
                                    img.style.display = 'block';
                                    span.style.display = 'none';
                                } else {
                                    img.style.display = 'none';
                                    span.textContent = val || 'emoji_events';
                                    span.style.display = 'block';
                                }
                            " 
                            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                        <div class="h-16 w-16 bg-gray-900 rounded border border-gray-700 overflow-hidden flex items-center justify-center">
                            <img src="" class="h-full w-full object-contain" style="display: none" onerror="this.style.display='none'">
                            <span class="material-icons text-white text-3xl">emoji_events</span>
                        </div>
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Link</label>
                    <input type="text" data-field="link" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>

            </div>
            <button type="button" onclick="this.closest('.group').remove()" class="text-red-500 hover:text-red-400 text-sm mt-2">
                Delete
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

// Attach to window
window.addAchievementItem = addAchievementItem;
