import { renderMainForm } from './sections/main.js';
import { renderNavbarForm } from './sections/navbar.js';
import { renderColorForm } from './sections/colors.js';
import { renderLiveActivities } from './sections/live_activities.js';
import { renderProjects } from './sections/projects.js';
import { renderSkills } from './sections/skills.js';
import { renderExperiences } from './sections/experiences.js';
import { renderEducations } from './sections/educations.js';
import { renderCertifications } from './sections/certifications.js';
import { renderAchievements } from './sections/achievements.js';
import { renderCRM } from './sections/crm.js';
import { renderAdminUsers } from './sections/users.js';

// Global state
window.currentSection = '';
window.currentData = null;

document.addEventListener('DOMContentLoaded', () => {
    // Optional: Auto-select first tab or handle deep linking if needed
});

export async function switchTab(section) {
    window.currentSection = section;
    
    // Update active tab styling
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('text-gray-300');
    });
    const activeBtn = document.getElementById(`tab-${section}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-blue-600', 'text-white');
        activeBtn.classList.remove('text-gray-300');
    }

    // Fetch data
    try {
        let url = `/admin/api/data/${section}`;
        if (section === 'crm') {
            url = `/admin/api/crm`;
        } else if (section === 'users') {
            url = `/admin/api/users`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        window.currentData = await response.json();

        // Render form based on section
        if (section === 'main') {
            renderMainForm(window.currentData);
        } else if (section === 'navbar') {
            renderNavbarForm(window.currentData);
        } else if (section === 'color_config' || section === 'syntax_colors') {
            renderColorForm(window.currentData, section);
        } else if (section === 'live_activities') {
            renderLiveActivities(window.currentData);
        } else if (section === 'projects') {
            renderProjects(window.currentData);
        } else if (section === 'skills') {
            renderSkills(window.currentData);
        } else if (section === 'experiences') {
            renderExperiences(window.currentData);
        } else if (section === 'educations') {
            renderEducations(window.currentData);
        } else if (section === 'certifications') {
            renderCertifications(window.currentData);
        } else if (section === 'achievements') {
            renderAchievements(window.currentData);
        } else if (section === 'crm') {
            renderCRM(window.currentData);
        } else if (section === 'users') {
            renderAdminUsers(window.currentData);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('content-area').innerHTML = `<p class="text-red-500">Error loading data.</p>`;
    }
}

export async function handleSave(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.innerText;
    button.innerText = 'Saving...';
    button.disabled = true;

    try {
        let payload;
        const currentSection = window.currentSection;

        if (currentSection === 'navbar') {
            const items = [];
            document.querySelectorAll('#navbar-items > div').forEach(div => {
                const item = {};
                div.querySelectorAll('[data-field]').forEach(input => {
                    const field = input.dataset.field;
                    if (input.type === 'checkbox') {
                        item[field] = input.checked;
                    } else {
                        item[field] = input.value;
                    }
                });
                items.push(item);
            });
            payload = items;
        } else if (currentSection === 'color_config' || currentSection === 'syntax_colors') {
            payload = {};
            const formData = new FormData(form);
            for (const [key, value] of formData.entries()) {
                const keys = key.split('.');
                let current = payload;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) current[keys[i]] = {};
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
            }
        } else if (currentSection === 'live_activities') {
            const items = Array.from(document.querySelectorAll('#activity-items > div'));
            payload = items.map(item => item.querySelector('[data-field="html"]').value);
        } else if (currentSection === 'projects') {
            const items = Array.from(document.querySelectorAll('#project-items > div'));
            payload = items.map(item => ({
                title: item.querySelector('[data-field="title"]').value,
                category: item.querySelector('[data-field="category"]').value,
                description: item.querySelector('[data-field="description"]').value,
                image: item.querySelector('[data-field="image"]').value,
                tags: item.querySelector('[data-field="tags"]').value.split(',').map(t => t.trim()).filter(t => t),
                featured: item.querySelector('[data-field="featured"]').checked
            }));
        } else if (currentSection === 'skills') {
            const items = Array.from(document.querySelectorAll('#skill-items > div'));
            payload = items.map(item => ({
                name: item.querySelector('[data-field="name"]').value,
                category: item.querySelector('[data-field="category"]').value,
                icon: item.querySelector('[data-field="icon"]').value,
                featured: item.querySelector('[data-field="featured"]').checked
            }));
        } else if (currentSection === 'experiences') {
            const items = Array.from(document.querySelectorAll('#experience-items > div'));
            payload = items.map(item => ({
                company: item.querySelector('[data-field="company"]').value,
                current: item.querySelector('[data-field="current"]').checked,
                roles: Array.from(item.querySelectorAll('.role-item')).map(role => ({
                    title: role.querySelector('[data-role-field="title"]').value,
                    period: role.querySelector('[data-role-field="period"]').value,
                    points: role.querySelector('[data-role-field="points"]').value.split('\n').filter(p => p.trim())
                }))
            }));
        } else if (currentSection === 'educations') {
            const items = Array.from(document.querySelectorAll('#education-items > div'));
            payload = items.map(item => ({
                school: item.querySelector('[data-field="school"]').value,
                degree: item.querySelector('[data-field="degree"]').value,
                location: item.querySelector('[data-field="location"]').value,
                year: item.querySelector('[data-field="year"]').value,
                current: item.querySelector('[data-field="current"]').checked
            }));
        } else if (currentSection === 'certifications') {
            const items = Array.from(document.querySelectorAll('#certification-items > div'));
            payload = items.map(item => ({
                name: item.querySelector('[data-field="name"]').value,
                issuer: item.querySelector('[data-field="issuer"]').value
            }));
        } else if (currentSection === 'achievements') {
            const items = Array.from(document.querySelectorAll('#achievement-items > div'));
            payload = items.map(item => ({
                title: item.querySelector('[data-field="title"]').value,
                description: item.querySelector('[data-field="description"]').value,
                date: item.querySelector('[data-field="date"]').value,
                icon: item.querySelector('[data-field="icon"]').value,
                link: item.querySelector('[data-field="link"]').value
            }));
        } else {
            // Main section (flat)
            const formData = new FormData(form);
            payload = Object.fromEntries(formData.entries());
            // Handle checkbox for main
            if (currentSection === 'main') {
                payload.PROFILE_ICON_FLAG = form.querySelector('[name="PROFILE_ICON_FLAG"]').checked;
            }
        }

        console.log('Sending payload:', payload);

        const response = await fetch(`/admin/api/data/${currentSection}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert('Changes saved successfully!');
        } else {
            const errorText = await response.text();
            console.error('Save failed:', response.status, errorText);
            alert('Failed to save changes: ' + response.status);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    } finally {
        button.innerText = originalText;
        button.disabled = false;
    }
}

// Attach to window
window.switchTab = switchTab;
window.handleSave = handleSave;
