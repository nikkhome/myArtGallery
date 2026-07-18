  // 1. Получаем ID работы из ссылки (например, ?id=2)
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id') || "1"; // Если id нет, показываем первую работу

        // 2. Берем данные из data.js
        const data = galleryData[id];

        if (data) {
            // Заполняем тексты
            document.title = `${data.title} — Экспонат`;
            document.getElementById('exhibit-title').innerText = data.title;
            document.getElementById('exhibit-material').innerText = data.material;
            document.getElementById('exhibit-size').innerText = data.size;
            document.getElementById('exhibit-year').innerText = data.year;
            document.getElementById('exhibit-desc').innerHTML = `<p>${data.desc}</p>`;
            document.getElementById('exhibit-status-text').innerText = data.status.replace('● ', '');
            
            // Настраиваем пульсирующую точку статуса
            const pulseDot = document.getElementById('exhibit-pulse');
            pulseDot.style.backgroundColor = data.statusColor;
            pulseDot.style.setProperty('--pulse-color', data.statusColor + '70'); // добавляем прозрачность для тени
            pulseDot.style.animation = 'pulse 2s infinite';

            // Ставим главное фото
            document.getElementById('main-view').src = data.images[0];

            // Генерируем миниатюры картинок
            const thumbContainer = document.getElementById('thumbnails-container');
            data.images.forEach((imgUrl, index) => {
                const thumb = document.createElement('div');
                thumb.className = `thumbnail hover-target ${index === 0 ? 'active' : ''}`;
                thumb.onclick = function() { changeImage(imgUrl, this); };
                thumb.innerHTML = `<img src="${imgUrl}" alt="Ракурс ${index + 1}">`;
                thumbContainer.appendChild(thumb);
            });
        }

        // Функция смены картинок
        function changeImage(src, element) {
            const mainImg = document.getElementById('main-view');
            mainImg.style.opacity = '0';
            mainImg.style.transition = 'opacity 0.2s ease';
            setTimeout(() => {
                mainImg.src = src;
                mainImg.style.opacity = '1';
            }, 200);
            
            const thumbs = document.querySelectorAll('.thumbnail');
            thumbs.forEach(t => t.classList.remove('active'));
            element.classList.add('active');
        }