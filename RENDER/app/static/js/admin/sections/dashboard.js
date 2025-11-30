export function renderDashboard(data) {
    const contentArea = document.getElementById('content-area');
    
    // Helper to render status color
    const getStatusColor = (status) => {
        if (status === 'Operational' || status === 'Connected') return 'text-green-500';
        if (status === 'Degraded Performance') return 'text-yellow-500';
        return 'text-red-500';
    };

    const systemStatusHtml = data.system_status.map(item => `
        <div class="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
            <div class="flex items-center text-gray-300">
                <span class="material-symbols-outlined mr-3 text-gray-500">
                    ${item.name === 'Server Health' ? 'dns' : item.name === 'Database Connection' ? 'storage' : 'api'}
                </span>
                ${item.name}
            </div>
            <div class="flex items-center ${item.color}">
                <span class="material-symbols-outlined text-xs mr-2" style="font-size: 10px;">circle</span>
                <span class="text-sm font-medium">${item.status}</span>
            </div>
        </div>
    `).join('');

    const recentActivitiesHtml = data.recent_activities.map(activity => `
        <div class="flex items-start py-4 border-b border-gray-700 last:border-0">
            <div class="flex-shrink-0 mr-4">
                <div class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                    <span class="material-symbols-outlined ${activity.icon_color}">
                        ${activity.icon}
                    </span>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">
                    ${activity.title}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                    ${activity.description}
                </p>
            </div>
            <div class="flex-shrink-0 ml-4 flex items-center">
                <span class="text-xs text-gray-500 mr-4">
                    <span class="material-symbols-outlined text-xs align-middle mr-1">calendar_today</span>
                    ${activity.date}
                </span>
                <a href="${activity.url}" target="_blank" class="text-gray-500 hover:text-white transition-colors">
                    <span class="material-symbols-outlined">open_in_new</span>
                </a>
            </div>
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- System Status -->
            <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-bold text-white">System Status</h3>
                </div>
                <div class="px-6 py-2">
                    ${systemStatusHtml}
                </div>
            </div>

            <!-- Recent Activities -->
            <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-bold text-white">Recent Activities</h3>
                </div>
                <div class="px-6">
                    ${recentActivitiesHtml.length > 0 ? recentActivitiesHtml : '<p class="py-4 text-gray-500 text-center">No recent activities found.</p>'}
                </div>
            </div>
        </div>
    `;
}
