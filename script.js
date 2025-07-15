document.addEventListener('DOMContentLoaded', () => {
    // Select all course elements once the DOM is fully loaded
    const courses = document.querySelectorAll('.course');

    // --- Utility Functions for Local Storage ---
    /**
     * Retrieves the saved course states from localStorage.
     * @returns {Object} An object where keys are course IDs and values are their states ('approved' or undefined).
     */
    const getSavedCourseStates = () => {
        try {
            const savedStates = localStorage.getItem('courseStates');
            return savedStates ? JSON.parse(savedStates) : {};
        } catch (e) {
            console.error("Error al leer de localStorage:", e);
            return {};
        }
    };

    /**
     * Saves the current course states to localStorage.
     * @param {Object} states - The object containing course states.
     */
    const saveCourseStates = (states) => {
        try {
            localStorage.setItem('courseStates', JSON.stringify(states));
        } catch (e) {
            console.error("Error al escribir en localStorage:", e);
        }
    };

    // Initialize course states from localStorage
    let courseStates = getSavedCourseStates();

    // --- Core Logic Functions ---
    /**
     * Checks if a specific course has been approved.
     * @param {string} courseId - The ID of the course.
     * @returns {boolean} True if the course is approved, false otherwise.
     */
    const isApproved = (courseId) => {
        return courseStates[courseId] === 'approved';
    };

    /**
     * Checks if all prerequisites for a given course are approved.
     * @param {HTMLElement} courseElement - The course DOM element.
     * @returns {boolean} True if all prerequisites are met, false otherwise.
     */
    const checkPrerequisites = (courseElement) => {
        const prerequisitesAttr = courseElement.dataset.prerequisites;
        if (!prerequisitesAttr) {
            return true; // No prerequisites, so it's always available.
        }
        // Split by comma, trim whitespace, and check if all are approved.
        const prerequisites = prerequisitesAttr.split(',').map(req => req.trim());
        return prerequisites.every(reqId => isApproved(reqId));
    };

    /**
     * Updates the visual and interactive state of a single course element.
     * This function adds/removes CSS classes and enables/disables the button.
     * @param {HTMLElement} courseElement - The course DOM element to update.
     */
    const updateCourseState = (courseElement) => {
        const courseId = courseElement.dataset.id;
        const approveBtn = courseElement.querySelector('.approve-btn');

        // Reset classes first to ensure correct state application
        courseElement.classList.remove('locked', 'unlocked', 'approved');

        if (isApproved(courseId)) {
            courseElement.classList.add('approved');
            approveBtn.textContent = 'Aprobado';
            approveBtn.disabled = true;
        } else if (checkPrerequisites(courseElement)) {
            courseElement.classList.add('unlocked');
            approveBtn.textContent = 'Aprobar';
            approveBtn.disabled = false;
        } else {
            courseElement.classList.add('locked');
            approveBtn.textContent = 'Bloqueado';
            approveBtn.disabled = true;
        }
    };

    /**
     * Marks a course as approved and triggers a full UI update.
     * @param {string} courseId - The ID of the course to approve.
     */
    const approveCourse = (courseId) => {
        // Only proceed if the course is not already approved
        if (!isApproved(courseId)) {
            courseStates[courseId] = 'approved';
            saveCourseStates(courseStates); // Save the new state
            updateAllCourses(); // Re-evaluate and update all courses
        }
    };

    /**
     * Iterates through all courses and updates their states.
     * This is crucial after any course approval to unlock dependent courses.
     */
    const updateAllCourses = () => {
        courses.forEach(courseElement => {
            updateCourseState(courseElement);
        });
    };

    // --- Event Handlers and Initial Setup ---
    // Attach click listeners to all approve buttons
    courses.forEach(courseElement => {
        const approveBtn = courseElement.querySelector('.approve-btn');
        approveBtn.addEventListener('click', () => {
            // Check if the button is not disabled before trying to approve
            if (!approveBtn.disabled) {
                const courseId = courseElement.dataset.id;
                approveCourse(courseId);
            }
        });
    });

    // Initial update of all course states when the page loads
    updateAllCourses();
});
