// Global variables
let selectedTimezone = 'Asia/Kolkata';
let selectedFont = 'inter';
let updateInterval;

// Initialize the app
function init() {
    loadSettings();
    setupEventListeners();
    updateAllData();

    // Update every second
    updateInterval = setInterval(updateAllData, 1000);
}

// Load saved settings
function loadSettings() {
    // Try to load from localStorage, fallback to defaults
    try {
        const savedTheme = localStorage.getItem('theme') || 'midnight';
        const savedTimezone = localStorage.getItem('timezone') || 'Asia/Kolkata';
        const savedFont = localStorage.getItem('font') || 'inter';

        applyTheme(savedTheme);
        applyFont(savedFont);
        selectedTimezone = savedTimezone;
        selectedFont = savedFont;

        // Update active state for timezone
        updateActiveTimezone(savedTimezone);
    } catch (e) {
        // If localStorage fails, just use defaults
        applyTheme('midnight');
        applyFont('inter');
    }
}

// Save settings
function saveSettings() {
    try {
        localStorage.setItem('theme', document.documentElement.getAttribute('data-theme') || 'midnight');
        localStorage.setItem('timezone', selectedTimezone);
        localStorage.setItem('font', selectedFont);
    } catch (e) {
        // Silently fail if localStorage is not available
        console.log('Unable to save settings');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Theme selector
    const themeButtons = document.querySelectorAll('[data-theme]');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            applyTheme(theme);
            saveSettings();
        });
    });

    // Font selector
    const fontButtons = document.querySelectorAll('[data-font]');
    fontButtons.forEach(button => {
        button.addEventListener('click', () => {
            const font = button.getAttribute('data-font');
            selectedFont = font;
            applyFont(font);
            saveSettings();
        });
    });

    // Timezone selector
    const timezoneButtons = document.querySelectorAll('[data-timezone]');
    timezoneButtons.forEach(button => {
        button.addEventListener('click', () => {
            const timezone = button.getAttribute('data-timezone');
            selectedTimezone = timezone;
            updateActiveTimezone(timezone);
            updateAllData();
            saveSettings();
        });
    });
}

// Update active timezone visual state
function updateActiveTimezone(timezone) {
    const timezoneButtons = document.querySelectorAll('[data-timezone]');
    timezoneButtons.forEach(button => {
        if (button.getAttribute('data-timezone') === timezone) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Apply theme
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// Apply font
function applyFont(font) {
    document.documentElement.setAttribute('data-font', font);
}

// Update all data
function updateAllData() {
    const now = new Date();

    updateCurrentDate(now);
    updateCurrentTime(now);
    updateDayOfYear(now);
    updateTimeRemaining(now);
    updateDaysRemaining(now);
}

// Update current date
function updateCurrentDate(now) {
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: selectedTimezone
    };

    const dateStr = now.toLocaleDateString('en-US', options);
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = dateStr;
    }

    // Update weekday
    const weekdayOptions = {
        weekday: 'long',
        timeZone: selectedTimezone
    };
    const weekdayStr = now.toLocaleDateString('en-US', weekdayOptions);
    const weekdayElement = document.getElementById('weekday');
    if (weekdayElement) {
        weekdayElement.textContent = weekdayStr;
    }
}

// Update current time
function updateCurrentTime(now) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: selectedTimezone
    };

    const timeStr = now.toLocaleTimeString('en-US', options);
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeStr;
    }

    // Update timezone display
    const timezoneDisplay = document.getElementById('timezone-display');
    if (timezoneDisplay) {
        const tzAbbr = getTimezoneAbbreviation(selectedTimezone);
        timezoneDisplay.textContent = tzAbbr;
    }
}

// Get timezone abbreviation
function getTimezoneAbbreviation(timezone) {
    const activeButton = document.querySelector(`[data-timezone="${timezone}"]`);
    if (activeButton) {
        return activeButton.getAttribute('data-abbr');
    }

    // Fallback map
    const tzMap = {
        'Asia/Kolkata': 'IST',
        'America/New_York': 'EST',
        'America/Los_Angeles': 'PST',
        'America/Chicago': 'CST',
        'Europe/London': 'GMT',
        'Europe/Paris': 'CET',
        'Asia/Tokyo': 'JST',
        'Asia/Shanghai': 'CST',
        'Asia/Dubai': 'GST',
        'Australia/Sydney': 'AEDT',
        'Pacific/Auckland': 'NZDT'
    };

    return tzMap[timezone] || timezone.split('/')[1];
}

// Update day of year
function updateDayOfYear(now) {
    // Get the date in the selected timezone
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: selectedTimezone }));
    const year = tzDate.getFullYear();
    const startOfYear = new Date(year, 0, 1);

    // Calculate day of year
    const diffTime = tzDate - startOfYear;
    const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check if leap year
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeapYear ? 366 : 365;

    // Update display
    const dayElement = document.getElementById('dayOfYear');
    if (dayElement) {
        dayElement.textContent = `${dayOfYear} / ${totalDays}`;
    }

    // Update progress bar
    const percentage = (dayOfYear / totalDays) * 100;
    const progressFill = document.getElementById('yearProgress');
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }

    const progressText = document.getElementById('yearProgress-text');
    if (progressText) {
        progressText.textContent = `${percentage.toFixed(1)}% of year completed`;
    }
}

// Update time remaining
function updateTimeRemaining(now) {
    // Get the current time in the selected timezone
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: selectedTimezone }));

    const hours = tzDate.getHours();
    const minutes = tzDate.getMinutes();
    const seconds = tzDate.getSeconds();

    // Calculate remaining time
    const remainingHours = 23 - hours;
    const remainingMinutes = 59 - minutes;
    const remainingSeconds = 59 - seconds;

    // Format time
    const formattedTime = `${String(remainingHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

    const timeElement = document.getElementById('timeRemaining');
    if (timeElement) {
        timeElement.textContent = formattedTime;
    }

    // Calculate percentage of day completed
    const totalSeconds = 24 * 60 * 60;
    const elapsedSeconds = (hours * 60 * 60) + (minutes * 60) + seconds;
    const percentage = (elapsedSeconds / totalSeconds) * 100;

    const progressFill = document.getElementById('dayProgress');
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }

    const progressText = document.getElementById('dayProgress-text');
    if (progressText) {
        progressText.textContent = `${percentage.toFixed(1)}% of day completed`;
    }
}

// Update days remaining
function updateDaysRemaining(now) {
    // Get the date in the selected timezone
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: selectedTimezone }));
    const year = tzDate.getFullYear();
    const startOfYear = new Date(year, 0, 1);

    // Calculate day of year
    const diffTime = tzDate - startOfYear;
    const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check if leap year
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeapYear ? 366 : 365;

    const daysRemaining = totalDays - dayOfYear;

    const daysElement = document.getElementById('daysRemaining');
    if (daysElement) {
        daysElement.textContent = daysRemaining;
    }

    const totalElement = document.getElementById('daysTotal');
    if (totalElement) {
        totalElement.textContent = `out of ${totalDays} days`;
    }
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Also support Cordova's deviceready event
document.addEventListener('deviceready', init, false);
