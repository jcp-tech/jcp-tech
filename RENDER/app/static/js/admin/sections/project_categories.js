import { handleSave } from '../dashboard.js';

export function renderProjectCategories(data) {
    const items = Array.isArray(data) ? data : [];
    const itemsHtml = items.map((item, index) => `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-center space-x-4 group">
            <div class="cursor-move text-gray-500 hover:text-white">
                <span class="material-symbols-outlined">drag_indicator</span>
            </div>
            <div class="flex-1">
                <input type="text" value="${item}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Category Name">
            </div>
            <button onclick="removeCategoryItem(this)" class="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10 transition-colors">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    `).join('');

    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-bold text-white">Project Categories</h2>
                <button onclick="addCategoryItem()" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2 transition-colors">
                    <span class="material-symbols-outlined text-sm">add</span>
                    <span>Add Category</span>
                </button>
            </div>

            <div id="categories-list" class="space-y-4">
                ${itemsHtml}
            </div>

            <div class="flex justify-end pt-4 border-t border-gray-700">
                <button onclick="saveCategories()" class="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded flex items-center space-x-2 transition-colors shadow-lg hover:shadow-green-500/20">
                    <span class="material-symbols-outlined text-sm">save</span>
                    <span>Save Changes</span>
                </button>
            </div>
        </div>
    `;
}

window.addCategoryItem = function() {
    const container = document.getElementById('categories-list');
    const div = document.createElement('div');
    div.className = 'bg-gray-800 p-4 rounded border border-gray-700 flex items-center space-x-4 group animate-in fade-in slide-in-from-top-4 duration-300';
    div.innerHTML = `
        <div class="cursor-move text-gray-500 hover:text-white">
            <span class="material-symbols-outlined">drag_indicator</span>
        </div>
        <div class="flex-1">
            <input type="text" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Category Name">
        </div>
        <button onclick="removeCategoryItem(this)" class="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10 transition-colors">
            <span class="material-symbols-outlined">delete</span>
        </button>
    `;
    container.appendChild(div);
}

window.removeCategoryItem = function(btn) {
    if (confirm('Are you sure you want to remove this category?')) {
        const item = btn.closest('.bg-gray-800');
        item.remove();
    }
}

window.saveCategories = function() {
    const container = document.getElementById('categories-list');
    const inputs = container.querySelectorAll('input[type="text"]');
    const data = Array.from(inputs)
        .map(input => input.value.trim())
        .filter(val => val !== ''); // Remove empty strings

    handleSave('project_categories', data);
}
