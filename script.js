document.addEventListener('DOMContentLoaded', () => {
    const courses = document.querySelectorAll('.course');

    // Función para obtener el estado guardado de los cursos
    const getSavedCourseStates = () => {
        try {
            const savedStates = localStorage.getItem('courseStates');
            return savedStates ? JSON.parse(savedStates) : {};
        } catch (e) {
            console.error("Error al leer de localStorage:", e);
            return {};
        }
    };

    // Función para guardar el estado de los cursos
    const saveCourseStates = (states) => {
        try {
            localStorage.setItem('courseStates', JSON.stringify(states));
        } catch (e) {
            console.error("Error al escribir en localStorage:", e);
        }
    };

    let courseStates = getSavedCourseStates();

    // Función para verificar si un curso está aprobado
    const isApproved = (courseId) => {
        return courseStates[courseId] === 'approved';
    };

    // Función para verificar si todos los prerrequisitos de un curso están aprobados
    const checkPrerequisites = (course) => {
        const prerequisitesAttr = course.dataset.prerequisites;
        if (!prerequisitesAttr) {
            return true; // No tiene prerrequisitos, siempre está disponible
        }
        const prerequisites = prerequisitesAttr.split(',').map(req => req.trim());
        return prerequisites.every(reqId => isApproved(reqId));
    };

    // Función para actualizar el estado visual y de interactividad de un curso
    const updateCourseState = (course) => {
        const courseId = course.dataset.id;
        const approveBtn = course.querySelector('.approve-btn');

        if (isApproved(courseId)) {
            course.classList.add('approved');
            course.classList.remove('locked', 'unlocked');
            approveBtn.textContent = 'Aprobado';
            approveBtn.disabled = true;
        } else if (checkPrerequisites(course)) {
            course.classList.add('unlocked');
            course.classList.remove('locked', 'approved');
            approveBtn.textContent = 'Aprobar';
            approveBtn.disabled = false;
        } else {
            course.classList.add('locked');
            course.classList.remove('unlocked', 'approved');
            approveBtn.textContent = 'Bloqueado';
            approveBtn.disabled = true;
        }
    };

    // Inicializar el estado de todos los cursos al cargar la página
    courses.forEach(course => {
        updateCourseState(course);
    });

    // Función para procesar la aprobación de un curso
    const approveCourse = (courseId) => {
        courseStates[courseId] = 'approved';
        saveCourseStates(courseStates);
        updateAllCourses(); // Volver a verificar todos los cursos después de un cambio
    };

    // Función para actualizar el estado de todos los cursos (útil después de un cambio)
    const updateAllCourses = () => {
        courses.forEach(course => {
            updateCourseState(course);
        });
    };

    // Añadir event listeners a los botones
    courses.forEach(course => {
        const approveBtn = course.querySelector('.approve-btn');
        approveBtn.addEventListener('click', () => {
            const courseId = course.dataset.id;
            if (!isApproved(courseId)) { // Solo si no está ya aprobado
                approveCourse(courseId);
            }
        });
    });
});
