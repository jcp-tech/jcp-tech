export function renderProjects(data) {
    const contentArea = document.getElementById('content-area');
    const items = Array.isArray(data) ? data : [];
    
    const itemsHtml = items.map((item, index) => `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Title</label>
                        <input type="text" data-field="title" value="${item.title || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Category</label>
                        <select data-field="category" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                            ${window.PROJECT_CATEGORIES.map(cat => {
                                const name = typeof cat === 'string' ? cat : cat.name;
                                const active = typeof cat === 'string' ? true : (cat.active !== false);
                                if (!active) return '';
                                return `<option value="${name}" ${item.category === name ? 'selected' : ''}>${name}</option>`;
                            }).join('')}
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea data-field="description" rows="2" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">${item.description || ''}</textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Image URL</label>
                        <input type="text" data-field="image" value="${item.image || ''}" oninput="this.closest('.group').querySelector('img').src = this.value" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                        <div class="mt-2 h-32 bg-gray-900 rounded border border-gray-700 overflow-hidden flex items-center justify-center">
                            <img src="${item.image || ''}" class="h-full w-auto object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; this.style.display='block'">
                            <span class="text-xs text-gray-500 ${item.image ? 'hidden' : ''}">No Image</span>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">Tags (comma separated)</label>
                            <input type="text" data-field="tags" value="${(item.tags || []).join(', ')}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center">
                                <input type="checkbox" data-field="featured" ${item.featured ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                <label class="ml-2 text-sm text-gray-400">Featured</label>
                            </div>
                            <div class="flex items-center">
                                <input type="checkbox" data-field="active" ${item.active !== false ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                <label class="ml-2 text-sm text-gray-400">Active</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" onclick="this.closest('.group').remove()" class="text-red-500 hover:text-red-400 text-sm mt-2">
                Delete
            </button>
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-white">Edit Projects</h2>
            <button onclick="addProjectItem()" type="button" class="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors">
                + Add Project
            </button>
        </div>
        <form id="edit-form" onsubmit="handleSave(event)" class="space-y-6 max-w-4xl">
            <div id="project-items" class="space-y-4">
                ${itemsHtml}
            </div>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
                Save Changes
            </button>
        </form>
    `;

    Sortable.create(document.getElementById('project-items'), {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'bg-gray-700'
    });
}

export function addProjectItem() {
    const start_from_top = false;
    const container = document.getElementById('project-items');
    const html = `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Title</label>
                        <input type="text" data-field="title" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Category</label>
                        <select data-field="category" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                            ${window.PROJECT_CATEGORIES.map(cat => {
                                const name = typeof cat === 'string' ? cat : cat.name;
                                const active = typeof cat === 'string' ? true : (cat.active !== false);
                                if (!active) return '';
                                return `<option value="${name}">${name}</option>`;
                            }).join('')}
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea data-field="description" rows="2" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Image URL</label>
                        <input type="text" data-field="image" oninput="this.closest('.group').querySelector('img').src = this.value" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                        <div class="mt-2 h-32 bg-gray-900 rounded border border-gray-700 overflow-hidden flex items-center justify-center">
                            <img src="" class="h-full w-auto object-cover hidden" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                            <span class="text-xs text-gray-500">No Image</span>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">Tags (comma separated)</label>
                            <input type="text" data-field="tags" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center">
                                <input type="checkbox" data-field="featured" class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                <label class="ml-2 text-sm text-gray-400">Featured</label>
                            </div>
                            <div class="flex items-center">
                                <input type="checkbox" data-field="active" checked class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                <label class="ml-2 text-sm text-gray-400">Active</label>
                            </div>
                        </div>
                    </div>
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
window.addProjectItem = addProjectItem;
