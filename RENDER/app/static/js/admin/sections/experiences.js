export function renderExperiences(data) {
    const contentArea = document.getElementById('content-area');
    const items = Array.isArray(data) ? data : [];
    
    const itemsHtml = items.map((item, index) => `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1 space-y-4">
                <div class="flex justify-between items-start">
                    <div class="flex-1 mr-4">
                        <label class="block text-xs text-gray-500 mb-1">Company</label>
                        <input type="text" data-field="company" value="${item.company || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div class="flex items-center mt-6 space-x-4">
                        <div class="flex items-center">
                            <input type="checkbox" data-field="current" ${item.current ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                            <label class="ml-2 text-sm text-gray-400">Current</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" data-field="active" ${item.active !== false ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                            <label class="ml-2 text-sm text-gray-400">Active</label>
                        </div>
                    </div>
                </div>
                
                <div class="pl-4 border-l-2 border-gray-700">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="text-sm font-semibold text-gray-400">Roles</h4>
                        <button type="button" onclick="addRole(this)" class="text-green-500 hover:text-green-400 text-xs font-bold">
                            + Add Role
                        </button>
                    </div>
                    <div class="roles-container space-y-3">
                        ${(item.roles || []).map(role => `
                            <div class="bg-gray-700 p-3 rounded border border-gray-600 relative role-item flex items-start space-x-3">
                                <div class="role-drag-handle cursor-move text-gray-500 hover:text-white mt-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
                                </div>
                                <div class="flex-1">
                                    <button type="button" onclick="this.closest('.role-item').remove()" class="absolute top-2 right-2 text-red-500 hover:text-red-400 text-xs">
                                        Delete
                                    </button>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                        <div>
                                            <label class="block text-xs text-gray-500 mb-1">Title</label>
                                            <input type="text" data-role-field="title" value="${role.title || ''}" class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                                        </div>
                                        <div>
                                            <label class="block text-xs text-gray-500 mb-1">Period</label>
                                            <input type="text" data-role-field="period" value="${role.period || ''}" class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                                        </div>
                                    </div>
                                    <div class="flex items-center mb-2">
                                        <input type="checkbox" data-role-field="active" ${role.active !== false ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500">
                                        <label class="ml-2 text-xs text-gray-400">Active</label>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">Points (one per line)</label>
                                        <textarea data-role-field="points" rows="3" class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">${(role.points || []).join('\n')}</textarea>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
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
            <h2 class="text-2xl font-bold text-white">Edit Experiences</h2>
            <button onclick="addExperienceItem()" type="button" class="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors">
                + Add Experience
            </button>
        </div>
        <form id="edit-form" onsubmit="handleSave(event)" class="space-y-6 max-w-4xl">
            <div id="experience-items" class="space-y-4">
                ${itemsHtml}
            </div>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
                Save Changes
            </button>
        </form>
    `;

    Sortable.create(document.getElementById('experience-items'), {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'bg-gray-700'
    });

    // Initialize Sortable for roles
    document.querySelectorAll('.roles-container').forEach(container => {
        Sortable.create(container, {
            handle: '.role-drag-handle',
            animation: 150,
            ghostClass: 'bg-gray-600'
        });
    });
}

export function addExperienceItem() {
    const start_from_top = true;
    const container = document.getElementById('experience-items');
    const html = `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1 space-y-4">
                <div class="flex justify-between items-start">
                    <div class="flex-1 mr-4">
                        <label class="block text-xs text-gray-500 mb-1">Company</label>
                        <input type="text" data-field="company" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div class="flex items-center mt-6 space-x-4">
                        <div class="flex items-center">
                            <input type="checkbox" data-field="current" class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                            <label class="ml-2 text-sm text-gray-400">Current</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" data-field="active" checked class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                            <label class="ml-2 text-sm text-gray-400">Active</label>
                        </div>
                    </div>
                </div>
                
                <div class="pl-4 border-l-2 border-gray-700">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="text-sm font-semibold text-gray-400">Roles</h4>
                        <button type="button" onclick="addRole(this)" class="text-green-500 hover:text-green-400 text-xs font-bold">
                            + Add Role
                        </button>
                    </div>
                    <div class="roles-container space-y-3">
                    </div>
                </div>
            </div>
            <button type="button" onclick="this.closest('.group').remove()" class="text-red-500 hover:text-red-400 text-sm mt-2">
                Delete
            </button>
        </div>
    `;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const newElement = tempDiv.firstElementChild;
    
    if (start_from_top) {
        container.prepend(newElement);
    } else {
        container.appendChild(newElement);
    }

    // Initialize Sortable for the new roles container
    Sortable.create(newElement.querySelector('.roles-container'), {
        handle: '.role-drag-handle',
        animation: 150,
        ghostClass: 'bg-gray-600'
    });
}

export function addRole(btn) {
    const start_from_top = true;
    const container = btn.closest('div').nextElementSibling;
    const html = `
        <div class="bg-gray-700 p-3 rounded border border-gray-600 relative role-item flex items-start space-x-3">
            <div class="role-drag-handle cursor-move text-gray-500 hover:text-white mt-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1">
                <button type="button" onclick="this.closest('.role-item').remove()" class="absolute top-2 right-2 text-red-500 hover:text-red-400 text-xs">
                    Delete
                </button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Title</label>
                        <input type="text" data-role-field="title" class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Period</label>
                        <input type="text" data-role-field="period" class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    </div>
                </div>
                <div class="flex items-center mb-2">
                    <input type="checkbox" data-role-field="active" checked class="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500">
                    <label class="ml-2 text-xs text-gray-400">Active</label>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Points (one per line)</label>
                    <textarea data-role-field="points" rows="3" class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"></textarea>
                </div>
            </div>
        </div>
    `;
    if (start_from_top) {
        container.insertAdjacentHTML('afterbegin', html);
    } else {
        container.insertAdjacentHTML('beforeend', html);
    }
}

// Attach to window
window.addExperienceItem = addExperienceItem;
window.addRole = addRole;
