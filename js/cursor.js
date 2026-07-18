        // --- Логика плавного кастомного курсора ---
        const cursor = document.getElementById('custom-cursor');
        const ring = document.getElementById('custom-cursor-ring');
        
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        function animateCursor() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Эффект увеличения курсора при наведении на работы
        const hoverTargets = document.querySelectorAll('.hover-target');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                ring.style.width = '60px';
                ring.style.height = '60px';
                ring.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                cursor.style.backgroundColor = '#00ff88'; /* Делаем зеленую точку при фокусе */
                cursor.style.width = '12px';
                cursor.style.height = '12px';
            });
            
            target.addEventListener('mouseleave', () => {
                ring.style.width = '30px';
                ring.style.height = '30px';
                ring.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                cursor.style.backgroundColor = '#fff';
                cursor.style.width = '8px';
                cursor.style.height = '8px';
            });
        });