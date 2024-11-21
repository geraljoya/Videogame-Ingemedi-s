document.addEventListener('DOMContentLoaded', () => {
    const app = document.querySelector('#app');
    const collectedTokens = Array(10).fill(false); // Rastreo de PokéTokens recolectados
    let pokeTokens = 0; // Contador de PokéTokens
    let powerMuls = 0; // Contador de Powermuls

    // Configuración de sonidos y música
    const sounds = {
        click: new Audio('assets/audio/sounds/click.mp3'),
        error: new Audio('assets/audio/sounds/error.mp3'),
        success: new Audio('assets/audio/sounds/success.mp3'),
        hover: new Audio('assets/audio/sounds/hover.mp3'),
        type: new Audio('assets/audio/sounds/type.mp3'),
    };

    const music = {
        background: new Audio('assets/audio/music/background.mp3'),
        welcome: new Audio('assets/audio/music/welcome.mp3'),
        quiz: new Audio('assets/audio/music/quiz.mp3'),
        victory: new Audio('assets/audio/music/victory.mp3'),
        defeat: new Audio('assets/audio/music/defeat.mp3'),
    };

    const playSound = (soundName) => {
        if (sounds[soundName]) {
            sounds[soundName].currentTime = 0; // Reinicia el sonido si ya está reproduciéndose
            sounds[soundName].play();
        }
    };

    const playMusic = (musicName) => {
        stopAllMusic();
        if (music[musicName]) {
            music[musicName].play();
        }
    };

    const stopAllMusic = () => {
        Object.values(music).forEach((track) => track.pause());
    };

    // Función para cargar vistas dinámicamente
    const loadView = async (view) => {
        try {
            const response = await fetch(`views/${view}.html`);
            const html = await response.text();
            app.innerHTML = html;

            // Mostrar u ocultar header y footer según la vista
            if (view === 'welcome' || view === 'defeat' || view === 'victory') {
                // Ocultar header y footer en welcome, defeat y victory
                document.querySelector('#header-bar').innerHTML = '';
                document.querySelector('#footer-bar').innerHTML = '';
            } else {
                // Renderizar header y footer en otras vistas
                renderHeaderAndFooter();
            }

            switch (view) {
                case 'welcome':
                    playMusic('welcome');
                    playSound('type')
                    initializeWelcomeView();
                    break;
                case 'mediapolis':
                    playMusic('background');
                    initializeMediapolisView();
                    break;
                case 'defeat':
                    playMusic('defeat');
                    playSound('type');
                    initializeDefeatView();
                    break;
                case 'victory':
                    playMusic('victory');
                    playSound('type');
                    initializeVictoryView();
                    break;
                default:
                    if (view.startsWith('powermul')) {
                        initializePowermulView(view);
                        playMusic('quiz'); // Música de quiz
                    } else {
                        console.error(`Vista desconocida: ${view}`);
                    }
            }
        } catch (error) {
            console.error('Error cargando la vista:', error);
        }
    };

    // Renderizar barra superior e inferior
    const renderHeaderAndFooter = () => {
        document.querySelector('#header-bar').innerHTML = `
            <div class="d-flex justify-content-between align-items-center px-4 py-2">
                <div class="d-flex gap-4 justify-content-center align-items-center">
                    <span id="pokeTokens" class="tooltip-trigger fw-bold" data-bs-toggle="tooltip" title="Has recolectado ${pokeTokens} PokéTokens de 10. ¡Sigue explorando!">
                        <img src="assets/images/poketoken-unlocked.png" alt="PokéToken" height="30"> ${pokeTokens}/10
                    </span>
                    
                    <!-- PowerMuls -->
                    <span id="powerMuls" class="tooltip-trigger fw-bold" data-bs-toggle="tooltip" title="Has conseguido ${powerMuls} Powermuls de 10. ¡Responde más acertijos!">
                        <img src="assets/images/powermul.png" alt="PowerMul" height="30"> ${powerMuls}/10
                    </span>
                </div>
                <div class="d-flex gap-4 justify-content-center align-items-center">
                    <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#helpModal">
                        <span class="material-icons">help_outline</span>
                    </button>
                    <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#confirmationModal">
                        <span class="material-icons">close</span>
                    </button>
                </div>
            </div>
        `;

        document.querySelector('#footer-bar').innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100">
                <h4 id="feedback" class="typing-container text-center fw-bolder m-0 py-3 text-danger">
                <img src="assets/images/guardiana-face.png" alt="Ingmedi@s" class="my-2" height="40px">
                    ¡Recolecta PokéTokens para avanzar!
                </h4>
            </div>
        `;

        // Inicializar tooltips de Bootstrap
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach((tooltipTriggerEl) => {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Sonido al pasar por encima de botones
        const buttons = document.querySelectorAll('button');
        buttons.forEach((button) => {
            button.addEventListener('mouseover', () => playSound('hover'));
            button.addEventListener('click', () => playSound('click'));
        });
    };

    // Función para manejar sonidos de texto (typing-container)
    const handleTypingSounds = () => {
        const typingElements = document.querySelectorAll('.typing-container');
        typingElements.forEach((element) => {
            element.addEventListener('animationstart', () => playSound('type'));
        });
    };

    // Vista inicial
    const initializeWelcomeView = () => {
        document.querySelector('#startGame').addEventListener('click', () => loadView('mediapolis'));
    };

    // Vista de Mediapolis
    const initializeMediapolisView = () => {
        const feedback = document.querySelector('#feedback');
        const tokens = document.querySelectorAll('.token');
        const avatar = document.querySelector('#avatar');

        // Evento de hover para los tokens
        tokens.forEach((token) => {
            token.addEventListener('mouseover', () => playSound('hover'));
        });

        // Actualizar estados de los tokens (activo/inactivo y desbloqueado)
        const updateTokenStates = () => {
            tokens.forEach((token, index) => {
                if (index < pokeTokens) {
                    // Tokens recolectados
                    token.src = 'assets/images/poketoken-unlocked.png';
                    token.classList.add('active');
                    token.classList.remove('inactive');
                } else if (index === pokeTokens) {
                    // Token actual (activo pero bloqueado)
                    token.src = 'assets/images/poketoken-locked.png';
                    token.classList.add('active');
                    token.classList.remove('inactive');
                } else {
                    // Tokens bloqueados (inactivos)
                    token.src = 'assets/images/poketoken-locked.png';
                    token.classList.add('inactive');
                    token.classList.remove('active');
                }
            });
        };

        // Mover el avatar al token activo
        const moveAvatarToToken = (index) => {
            const token = tokens[index];
            if (token) {
                const tokenRect = token.getBoundingClientRect();
                const containerRect = document.querySelector('.mediapolis-container').getBoundingClientRect();

                // Ajustes dinámicos en el eje X e Y
                const adjustmentX = -700; // Ajuste adicional en el eje X
                const avatarOffsetX = tokenRect.left - containerRect.left + tokenRect.width / 2 - avatar.offsetWidth / 2 + adjustmentX;
                const adjustmentY = -20; // Ajuste adicional en el eje Y
                const avatarOffsetY = tokenRect.top - containerRect.top + tokenRect.height / 2 - avatar.offsetHeight / 2 + adjustmentY;

                // Aplicar transformaciones con transición
                avatar.style.transition = 'transform 0.3s ease-in-out';
                avatar.style.transform = `translate(${avatarOffsetX}px, ${avatarOffsetY}px)`;
            }
        };

        // Inicializar estados visuales de los tokens
        updateTokenStates();

        // Mover el avatar al token actual
        moveAvatarToToken(pokeTokens);

        // Añadir eventos de clic a los tokens
        tokens.forEach((token, index) => {
            token.addEventListener('click', () => {
                if (index === pokeTokens) {
                    // Recolectar el token actual
                    collectedTokens[index] = true;
                    pokeTokens++;
                    updateScores();

                    if (pokeTokens < 10) {
                        // Si no es el último token, cargar la vista de desafío
                        loadView(`powermul${pokeTokens}`);
                    } else if (pokeTokens === 10) {
                        // Si es el último token, cargar primero el desafío
                        loadView(`powermul${pokeTokens}`); // Vista del desafío final
                    }

                    // Actualizar estados visuales y mover el avatar al siguiente token
                    updateTokenStates();
                    moveAvatarToToken(pokeTokens);
                } else if (index < pokeTokens) {
                    // Feedback para tokens ya recolectados
                    feedback.textContent = 'Este PokéToken ya fue recolectado.';
                } else {
                    // Feedback para tokens bloqueados
                    feedback.textContent = 'Este PokéToken aún está bloqueado.';
                }
            });
        });

    };


    // Función para actualizar el estado de los personajes
    const updateCharactersState = (activeCharacter) => {
        const guardiana = document.querySelector('.guardiana');
        const learner = document.querySelector('.learner');

        if (activeCharacter === 'guardiana') {
            guardiana.classList.remove('inactive');
            guardiana.classList.add('active');
            learner.classList.remove('active');
            learner.classList.add('inactive');
        } else if (activeCharacter === 'learner') {
            learner.classList.remove('inactive');
            learner.classList.add('active');
            guardiana.classList.remove('active');
            guardiana.classList.add('inactive');
        } else if (activeCharacter === 'both') {
            learner.classList.remove('inactive');
            learner.classList.add('active');
            guardiana.classList.remove('inactive');
            guardiana.classList.add('active');
        }
    };


    // Vista Powermul
    const initializePowermulView = (view) => {
        const nextButton = document.querySelector('#nextStep');
        const dialogueContent = document.querySelector('#dialogue-content');
        const informationSection = document.querySelector('#information-section');
        const challengeSection = document.querySelector('#challenge-section');
        const resultSection = document.querySelector('#result-section');
        const challengeOptions = document.querySelectorAll('.option');
        const returnToCityButton = document.querySelector('#returnToCity');
        const footerFeedback = document.querySelector('#feedback');
        let attempts = 3;

        // Paso 1: Mostrar información
        nextButton.addEventListener('click', () => {
            dialogueContent.classList.add('d-none');
            informationSection.classList.remove('d-none');
            nextButton.classList.add('d-none');

            // Activar la guardiana y desactivar el avatar
            updateCharactersState('guardiana');
        });

        // Paso 2: Ir al desafío
        document.querySelector('#startChallenge').addEventListener('click', () => {
            informationSection.classList.add('d-none');
            challengeSection.classList.remove('d-none');

            // Activar el avatar y desactivar la guardiana
            updateCharactersState('learner');
        });

        // Paso 3: Resolver el acertijo
        challengeOptions.forEach((option) => {
            option.addEventListener('click', (e) => {
                const isCorrect = e.target.dataset.correct === "true";
                if (isCorrect) {
                    challengeSection.classList.add('d-none');
                    resultSection.classList.remove('d-none');
                    powerMuls++;
                    updateScores();

                    // Reproducir sonido de éxito
                    sounds.success.play();

                    // Comprobar si todos los PokéTokens y Powermuls están recolectados
                    if (pokeTokens === 10 && powerMuls === 10) {
                        loadView('victory'); // Cargar la vista de victoria
                    } else {
                        // Activar ambos personajes
                        updateCharactersState('both');
                    }
                } else {
                    attempts--;
                    footerFeedback.textContent = `Te quedan ${attempts} intento(s).`;

                    // Reproducir sonido de error
                    sounds.error.play();

                    if (attempts === 0) {
                        loadView('defeat');
                    }
                }
            });
        });

        // Paso 4: Volver a Mediapolis
        returnToCityButton.addEventListener('click', () => {
            // Comprobar antes de volver a Mediapolis
            if (pokeTokens === 10 && powerMuls === 10) {
                loadView('victory'); // Asegurar que no vuelva a Mediapolis al completar el juego
            } else {
                loadView('mediapolis');
            }
        });
    };

    // Vista Victory
    const initializeVictoryView = () => {
        document.querySelector('.progress-bar[aria-valuenow="10"]').style.width = '100%';
        document.querySelector('#restartGame').addEventListener('click', resetGame);
    };

    // Vista Defeat
    const initializeDefeatView = () => {
        // Actualizar la barra de PokéTokens
        const pokeTokensBar = document.querySelector('.progress-bar[aria-valuenow="pokeTokens"]');
        pokeTokensBar.style.width = `${pokeTokens * 10}%`;
        pokeTokensBar.textContent = `${pokeTokens}/10`;

        // Actualizar la barra de Powermuls
        const powerMulsBar = document.querySelector('.progress-bar[aria-valuenow="powerMuls"]');
        powerMulsBar.style.width = `${powerMuls * 10}%`;
        powerMulsBar.textContent = `${powerMuls}/10`;

        // Escuchar el botón de reinicio
        document.querySelector('#restartGame').addEventListener('click', resetGame);
    };

    // Actualizar marcadores
    const updateScores = () => {
        document.querySelector('#pokeTokens').innerHTML = `
            <img src="assets/images/poketoken-unlocked.png" alt="PokéToken" height="30"> ${pokeTokens}/10

        `;
        document.querySelector('#powerMuls').innerHTML = `
            <img src="assets/images/powermul.png" alt="PowerMul" height="30"> ${powerMuls}/10
        `;
    };

    // Reiniciar el progreso del juego
    const resetGame = () => {
        pokeTokens = 0;
        powerMuls = 0;
        collectedTokens.fill(false);
        loadView('welcome'); // Cargar la pantalla inicial
    };

    // Función para cargar modales dinámicamente
    const loadModal = async (modalName) => {
        try {
            const response = await fetch(`views/modals/${modalName}.html`);
            const modalHtml = await response.text();
            document.body.insertAdjacentHTML('beforeend', modalHtml); // Inserta el modal al final del body
        } catch (error) {
            console.error(`Error cargando el modal ${modalName}:`, error);
        }
    };

    // Cargar los modales y la vista inicial
    (async () => {
        await loadModal('helpModal');
        await loadModal('confirmationModal');
        loadView('welcome');
    })();

    // Escuchar el botón "Reiniciar" dentro del modal de confirmación
    document.addEventListener('click', (e) => {
        if (e.target.id === 'resetGame') {
            const modalInstance = bootstrap.Modal.getInstance(document.querySelector('#confirmationModal'));
            modalInstance.hide(); // Cerrar el modal
            resetGame(); // Reiniciar el juego
        }
    });
});
