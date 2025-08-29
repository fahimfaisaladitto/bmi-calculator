// --- Dark Mode Logic ---
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;
const toggleBall = document.getElementById('toggleBall');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

function setTheme(isDark) {
    htmlElement.classList.toggle('dark', isDark);
    if (isDark) {
        toggleBall.style.transform = 'translateX(24px)';
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        toggleBall.style.transform = 'translateX(0)';
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialThemeIsDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
setTheme(initialThemeIsDark);
darkModeToggle.checked = initialThemeIsDark;

darkModeToggle.addEventListener('change', () => {
    setTheme(darkModeToggle.checked);
    localStorage.setItem('theme', darkModeToggle.checked ? 'dark' : 'light');
});

// --- BMI Calculator Logic ---
const calculateBtn = document.getElementById('calculateBtn');
const clearBtn = document.getElementById('clearBtn');
const resultContainer = document.getElementById('resultContainer');
const errorText = document.getElementById('errorText');
const bmiValueEl = document.getElementById('bmiValue');
const bmiCategoryEl = document.getElementById('bmiCategory');
const bmiGaugeNeedle = document.getElementById('bmiGaugeNeedle');

// Arc elements
const underweightArc = document.getElementById('underweightArc');
const normalArc = document.getElementById('normalArc');
const overweightArc = document.getElementById('overweightArc');
const obesityArc = document.getElementById('obesityArc');

// Inputs
const ageInput = document.getElementById('age');
const weightInput = document.getElementById('weight');
const feetInput = document.getElementById('feet');
const inchesInput = document.getElementById('inches');

function showError(message) {
    errorText.textContent = message;
    errorText.classList.remove('hidden');
    resultContainer.classList.add('hidden');
}

function clearAll() {
    ageInput.value = '';
    weightInput.value = '';
    feetInput.value = '';
    inchesInput.value = '';
    resultContainer.classList.add('hidden');
    errorText.classList.add('hidden');
}

calculateBtn.addEventListener('click', () => {
    const age = parseFloat(ageInput.value);
    const weightKg = parseFloat(weightInput.value);
    const feet = parseFloat(feetInput.value);
    const inches = parseFloat(inchesInput.value) || 0;

    if (isNaN(age) || isNaN(weightKg) || isNaN(feet) || age <= 0 || weightKg <= 0 || feet < 0 || inches < 0) {
        showError('Please enter valid age, weight, and height.');
        return;
    }
    
    const totalInches = (feet * 12) + inches;
    if (totalInches <= 0) {
         showError('Please enter a valid height.');
        return;
    }
    
    const heightInMeters = totalInches * 0.0254;
    const bmi = weightKg / (heightInMeters * heightInMeters);

    displayResult(bmi);
});

function displayResult(bmi) {
    errorText.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    
    bmiValueEl.textContent = bmi.toFixed(1);

    let category = '';
    let colorClass = '';

    if (bmi < 18.5) {
        category = 'Underweight';
        colorClass = 'text-blue-500 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        category = 'Normal weight';
        colorClass = 'text-green-500 bg-green-100 dark:bg-green-900 dark:text-green-300';
    } else if (bmi >= 25 && bmi <= 29.9) {
        category = 'Overweight';
        colorClass = 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    } else {
        category = 'Obesity';
        colorClass = 'text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300';
    }
    
    bmiCategoryEl.textContent = category;
    bmiCategoryEl.className = `font-semibold text-lg p-2 rounded-lg ${colorClass}`;
    
    // Update Gauge Needle
    const minBmi = 15;
    const maxBmi = 40;
    const clampedBmi = Math.max(minBmi, Math.min(maxBmi, bmi));
    const angle = ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 180 - 90;
    bmiGaugeNeedle.style.transform = `rotate(${angle}deg)`;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;       
}

function initializeGauge() {
    const minBmi = 15;
    const maxBmi = 40;
    const range = maxBmi - minBmi;

    const underweightEnd = 18.5;
    const normalEnd = 25;
    const overweightEnd = 30;

    const underweightStartAngle = -90;
    const underweightEndAngle = ((underweightEnd - minBmi) / range) * 180 - 90;
    
    const normalStartAngle = underweightEndAngle;
    const normalEndAngle = ((normalEnd - minBmi) / range) * 180 - 90;

    const overweightStartAngle = normalEndAngle;
    const overweightEndAngle = ((overweightEnd - minBmi) / range) * 180 - 90;

    const obesityStartAngle = overweightEndAngle;
    const obesityEndAngle = 90;

    underweightArc.setAttribute('d', describeArc(60, 60, 50, underweightStartAngle, underweightEndAngle));
    normalArc.setAttribute('d', describeArc(60, 60, 50, normalStartAngle, normalEndAngle));
    overweightArc.setAttribute('d', describeArc(60, 60, 50, overweightStartAngle, overweightEndAngle));
    obesityArc.setAttribute('d', describeArc(60, 60, 50, obesityStartAngle, obesityEndAngle));
}

document.addEventListener('DOMContentLoaded', initializeGauge);
clearBtn.addEventListener('click', clearAll);
