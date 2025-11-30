export function renderSkills(data) {
    const contentArea = document.getElementById('content-area');
    const items = Array.isArray(data) ? data : [];
    
    const itemsHtml = items.map((item, index) => `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Name</label>
                    <input type="text" data-field="name" value="${item.name || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Category</label>
                    <input type="text" data-field="category" value="${item.category || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Icon (Devicon class or URL)</label>
                    <div class="flex items-center space-x-2">
                         <input type="text" data-field="icon" value="${item.icon || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                         <i class="${item.icon || ''} text-2xl text-white"></i>
                    </div>
                </div>
                <div class="flex items-end">
                    <div class="flex items-center">
                        <input type="checkbox" data-field="featured" ${item.featured ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                        <label class="ml-2 text-sm text-gray-400">Featured</label>
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
            <h2 class="text-2xl font-bold text-white">Edit Skills</h2>
            <button onclick="addSkillItem()" type="button" class="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors">
                + Add Skill
            </button>
        </div>
        <form id="edit-form" onsubmit="handleSave(event)" class="space-y-6 max-w-4xl">
            <div id="skill-items" class="space-y-4">
                ${itemsHtml}
            </div>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
                Save Changes
            </button>
        </form>
    `;

    Sortable.create(document.getElementById('skill-items'), {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'bg-gray-700'
    });
}

export function addSkillItem() {
    const container = document.getElementById('skill-items');
    const html = `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Name</label>
                    <input type="text" data-field="name" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Category</label>
                    <input type="text" data-field="category" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Icon (Devicon class or URL)</label>
                    <div class="flex items-center space-x-2">
                         <input type="text" data-field="icon" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    </div>
                </div>
                <div class="flex items-end">
                    <div class="flex items-center">
                        <input type="checkbox" data-field="featured" class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                        <label class="ml-2 text-sm text-gray-400">Featured</label>
                    </div>
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
window.addSkillItem = addSkillItem;
