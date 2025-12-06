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
                    <label class="block text-xs text-gray-500 mb-1">Icon (SVG Code, URL, or Material Name)</label>
                    <div class="flex items-center space-x-2">
                        <textarea data-field="icon" rows="3"
                            oninput="
                                const val = this.value.trim();
                                const container = this.nextElementSibling;
                                const img = container.querySelector('img');
                                const span = container.querySelector('span');
                                const svgContainer = container.querySelector('.svg-preview');
                                
                                // Reset all
                                img.style.display = 'none';
                                span.style.display = 'none';
                                svgContainer.innerHTML = '';
                                svgContainer.style.display = 'none';

                                if (val.startsWith('<svg')) {
                                    svgContainer.innerHTML = val;
                                    svgContainer.style.display = 'flex';
                                    // Ensure SVG scales
                                    const svg = svgContainer.querySelector('svg');
                                    if (svg) {
                                        svg.style.width = '100%';
                                        svg.style.height = '100%';
                                    }
                                } else if (val.startsWith('http') || val.startsWith('/')) {
                                    img.src = val;
                                    img.style.display = 'block';
                                } else {
                                    span.textContent = val || 'emoji_events';
                                    span.style.display = 'block';
                                }
                            " 
                            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500 font-mono text-xs">${item.icon || ''}</textarea>
                        <div class="h-16 w-16 min-w-[4rem] bg-gray-900 rounded border border-gray-700 overflow-hidden flex items-center justify-center p-2">
                            <img src="${item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? item.icon : ''}" 
                                 class="h-full w-full object-contain" 
                                 style="display: ${item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? 'block' : 'none'}" 
                                 onerror="this.style.display='none'">
                            <span class="material-icons text-white text-3xl" 
                                  style="display: ${item.icon && !item.icon.startsWith('<svg') && !(item.icon.startsWith('http') || item.icon.startsWith('/')) ? 'block' : 'none'}">
                                ${item.icon && !item.icon.startsWith('<svg') && !(item.icon.startsWith('http') || item.icon.startsWith('/')) ? item.icon : 'emoji_events'}
                            </span>
                            <div class="svg-preview w-full h-full flex items-center justify-center text-white"
                                 style="display: ${item.icon && item.icon.startsWith('<svg') ? 'flex' : 'none'}">
                                 ${item.icon && item.icon.startsWith('<svg') ? item.icon : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Link</label>
                    <input type="text" data-field="link" value="${item.link || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div class="flex items-center">
                    <input type="checkbox" data-field="active" ${item.active !== false ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                    <label class="ml-2 text-sm text-gray-400">Active</label>
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
    const start_from_top = false;
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
                    <label class="block text-xs text-gray-500 mb-1">Icon (SVG Code, URL, or Material Name)</label>
                    <div class="flex items-center space-x-2">
                        <textarea data-field="icon" rows="3"
                            oninput="
                                const val = this.value.trim();
                                const container = this.nextElementSibling;
                                const img = container.querySelector('img');
                                const span = container.querySelector('span');
                                const svgContainer = container.querySelector('.svg-preview');
                                
                                // Reset all
                                img.style.display = 'none';
                                span.style.display = 'none';
                                svgContainer.innerHTML = '';
                                svgContainer.style.display = 'none';

                                if (val.startsWith('<svg')) {
                                    svgContainer.innerHTML = val;
                                    svgContainer.style.display = 'flex';
                                    // Ensure SVG scales
                                    const svg = svgContainer.querySelector('svg');
                                    if (svg) {
                                        svg.style.width = '100%';
                                        svg.style.height = '100%';
                                    }
                                } else if (val.startsWith('http') || val.startsWith('/')) {
                                    img.src = val;
                                    img.style.display = 'block';
                                } else {
                                    span.textContent = val || 'emoji_events';
                                    span.style.display = 'block';
                                }
                            " 
                            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500 font-mono text-xs"></textarea>
                        <div class="h-16 w-16 min-w-[4rem] bg-gray-900 rounded border border-gray-700 overflow-hidden flex items-center justify-center p-2">
                            <img src="" class="h-full w-full object-contain" style="display: none" onerror="this.style.display='none'">
                            <span class="material-icons text-white text-3xl">emoji_events</span>
                            <div class="svg-preview w-full h-full flex items-center justify-center text-white" style="display: none"></div>
                        </div>
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Link</label>
                    <input type="text" data-field="link" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div class="flex items-center">
                    <input type="checkbox" data-field="active" checked class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                    <label class="ml-2 text-sm text-gray-400">Active</label>
                </div>

            </div>
            <button type="button" onclick="this.closest('.group').remove()" class="text-red-500 hover:text-red-400 text-sm mt-2">
                Delete
            </button>
        </div>
    `;
    if (start_from_top) {
        container.insertAdjacentHTML('afterbegin', html);
    } else {
        container.insertAdjacentHTML('beforeend', html);
    }
}

// Attach to window
window.addAchievementItem = addAchievementItem;
